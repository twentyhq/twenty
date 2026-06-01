import { Injectable } from '@nestjs/common';

import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsRelations, type ObjectLiteral } from 'typeorm';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  buildFieldMapsFromFlatObjectMetadata,
  type FieldMapsForObject,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

@Injectable()
export class ProcessNestedRelationsV2Helper {
  constructor() {}

  public async processNestedRelations<T extends ObjectRecord = ObjectRecord>({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    parentObjectMetadataItem,
    parentObjectRecords,
    parentObjectRecordsAggregatedValues = {},
    relations,
    aggregate = {},
    limit,
    authContext,
    workspaceDataSource,
    rolePermissionConfig,
    selectedFields,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    parentObjectMetadataItem: FlatObjectMetadata;
    parentObjectRecords: T[];
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    parentObjectRecordsAggregatedValues?: Record<string, any>;
    relations: Record<string, FindOptionsRelations<ObjectLiteral>>;
    aggregate?: Record<string, AggregationField>;
    limit: number;
    authContext: WorkspaceAuthContext;
    workspaceDataSource: GlobalWorkspaceDataSource;
    rolePermissionConfig?: RolePermissionConfig;
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    selectedFields: Record<string, any>;
  }): Promise<void> {
    const processRelationTasks = Object.entries(relations).map(
      ([sourceFieldName, nestedRelations]) =>
        this.processRelation({
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          parentObjectMetadataItem,
          parentObjectRecords,
          parentObjectRecordsAggregatedValues,
          sourceFieldName,
          nestedRelations,
          aggregate,
          limit,
          authContext,
          workspaceDataSource,
          rolePermissionConfig,
          selectedFields:
            selectedFields[sourceFieldName] instanceof Object
              ? selectedFields[sourceFieldName]
              : undefined,
        }),
    );

    await Promise.all(processRelationTasks);
  }

  private async processRelation<T extends ObjectRecord = ObjectRecord>({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    parentObjectMetadataItem,
    parentObjectRecords,
    parentObjectRecordsAggregatedValues,
    sourceFieldName,
    nestedRelations,
    aggregate,
    limit,
    authContext,
    workspaceDataSource,
    rolePermissionConfig,
    selectedFields,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    parentObjectMetadataItem: FlatObjectMetadata;
    parentObjectRecords: T[];
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    parentObjectRecordsAggregatedValues: Record<string, any>;
    sourceFieldName: string;
    nestedRelations: FindOptionsRelations<ObjectLiteral>;
    aggregate: Record<string, AggregationField>;
    limit: number;
    authContext: WorkspaceAuthContext;
    workspaceDataSource: GlobalWorkspaceDataSource;
    rolePermissionConfig?: RolePermissionConfig;
    selectedFields: Record<string, unknown>;
  }): Promise<void> {
    const fieldMaps = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      parentObjectMetadataItem,
    );

    const sourceFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMaps.fieldIdByName[sourceFieldName],
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!sourceFieldMetadata) {
      return;
    }

    if (
      !isFieldMetadataEntityOfType(
        sourceFieldMetadata,
        FieldMetadataType.RELATION,
      ) &&
      !isFieldMetadataEntityOfType(
        sourceFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      )
    ) {
      // TODO: Maybe we should throw an error here ?
      return;
    }

    if (!sourceFieldMetadata.settings) {
      throw new GraphqlQueryRunnerException(
        `Relation settings not found for field ${sourceFieldName}`,
        GraphqlQueryRunnerExceptionCode.RELATION_SETTINGS_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const relationType = sourceFieldMetadata.settings?.relationType;
    const { targetRelationName, targetObjectMetadata, targetRelation } =
      this.getTargetObjectMetadata({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem,
        sourceFieldName,
        fieldMaps,
      });

    const targetObjectRepository = workspaceDataSource.getRepository(
      targetObjectMetadata.nameSingular,
      rolePermissionConfig,
    );

    const targetObjectNameSingular = targetObjectMetadata.nameSingular;

    let targetObjectQueryBuilder = targetObjectRepository.createQueryBuilder(
      targetObjectNameSingular,
    );

    const columnsToSelect: Record<string, boolean> = buildColumnsToSelect({
      select: selectedFields,
      relations: nestedRelations,
      flatObjectMetadata: targetObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (relationType === RelationType.MANY_TO_ONE) {
      columnsToSelect.deletedAt = true;
      targetObjectQueryBuilder = targetObjectQueryBuilder.withDeleted();
    }

    targetObjectQueryBuilder = targetObjectQueryBuilder.setFindOptions({
      select: columnsToSelect,
    });

    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: sourceFieldName,
    });

    const relationIds = this.getUniqueIds({
      records: parentObjectRecords,
      idField:
        relationType === RelationType.ONE_TO_MANY ? 'id' : joinColumnName,
    });

    if (
      relationType === RelationType.ONE_TO_MANY &&
      !isDefined(targetRelationName)
    ) {
      throw new GraphqlQueryRunnerException(
        `Could not resolve target relation for one-to-many field ${sourceFieldName}`,
        GraphqlQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const fieldMetadataTargetRelationColumnName =
      computeMorphOrRelationFieldJoinColumnName({
        name:
          targetRelation &&
          isFieldMetadataEntityOfType(
            targetRelation,
            FieldMetadataType.MORPH_RELATION,
          )
            ? targetRelation.name
            : (targetRelationName as string),
      });

    const { relationResults, relationAggregatedFieldsResult } =
      await this.findRelations({
        referenceQueryBuilder: targetObjectQueryBuilder,
        column:
          relationType === RelationType.ONE_TO_MANY
            ? `"${fieldMetadataTargetRelationColumnName}"`
            : 'id',
        ids: relationIds,
        limit: limit * parentObjectRecords.length,
        aggregate,
        sourceFieldName,
        targetObjectNameSingular,
      });

    this.assignRelationResults({
      parentRecords: parentObjectRecords,
      parentObjectRecordsAggregatedValues,
      relationResults,
      relationAggregatedFieldsResult,
      sourceFieldName,
      joinField:
        relationType === RelationType.ONE_TO_MANY
          ? `${fieldMetadataTargetRelationColumnName}`
          : 'id',
      joinColumnName,
      relationType,
      selectedFields,
    });

    if (Object.keys(nestedRelations).length > 0) {
      await this.processNestedRelations({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem: targetObjectMetadata,
        parentObjectRecords: relationResults as ObjectRecord[],
        parentObjectRecordsAggregatedValues: relationAggregatedFieldsResult,
        relations: nestedRelations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        aggregate,
        limit,
        authContext,
        workspaceDataSource,
        rolePermissionConfig,
        selectedFields,
      });
    }
  }

  private getTargetObjectMetadata({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    parentObjectMetadataItem,
    sourceFieldName,
    fieldMaps,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    parentObjectMetadataItem: FlatObjectMetadata;
    sourceFieldName: string;
    fieldMaps: FieldMapsForObject;
  }) {
    const targetFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMaps.fieldIdByName[sourceFieldName],
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!targetFieldMetadata) {
      throw new GraphqlQueryRunnerException(
        `Field ${sourceFieldName} not found on object ${parentObjectMetadataItem.nameSingular}`,
        GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const targetObjectMetadata = getTargetObjectMetadataOrThrow(
      targetFieldMetadata,
      flatObjectMetadataMaps,
    );

    if (
      !targetFieldMetadata.relationTargetObjectMetadataId ||
      !targetFieldMetadata.relationTargetFieldMetadataId
    ) {
      throw new GraphqlQueryRunnerException(
        `Relation target object metadata id or field metadata id not found for field ${sourceFieldName}`,
        GraphqlQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const targetRelation = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: targetFieldMetadata.relationTargetFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    const targetRelationName = targetRelation?.name;

    return { targetRelationName, targetObjectMetadata, targetRelation };
  }

  private getUniqueIds({
    records,
    idField,
  }: {
    records: ObjectRecord[];
    idField: string;
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  }): any[] {
    return [...new Set(records.map((item) => item[idField]))];
  }

  private async findRelations({
    referenceQueryBuilder,
    column,
    ids,
    limit,
    aggregate,
    sourceFieldName,
    targetObjectNameSingular,
  }: {
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    referenceQueryBuilder: WorkspaceSelectQueryBuilder<any>;
    column: string;
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    ids: any[];
    limit: number;
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    aggregate: Record<string, any>;
    sourceFieldName: string;
    targetObjectNameSingular: string;
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  }): Promise<{ relationResults: any[]; relationAggregatedFieldsResult: any }> {
    if (ids.length === 0) {
      return { relationResults: [], relationAggregatedFieldsResult: {} };
    }

    const aggregateForRelation = aggregate[sourceFieldName];
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    let relationAggregatedFieldsResult: Record<string, any> = {};

    if (aggregateForRelation) {
      const aggregateQueryBuilder = referenceQueryBuilder.clone();

      ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
        selectedAggregatedFields: aggregateForRelation,
        queryBuilder: aggregateQueryBuilder,
        objectMetadataNameSingular: targetObjectNameSingular,
      });

      const aggregatedFieldsValues = await aggregateQueryBuilder
        .addSelect(column)
        .where(`${column} IN (:...ids)`, {
          ids,
        })
        .groupBy(column)
        .getRawMany();

      relationAggregatedFieldsResult = aggregatedFieldsValues.reduce(
        (acc, item) => {
          const columnWithoutQuotes = column.replace(/["']/g, '');
          const key = item[columnWithoutQuotes];
          const { [column]: _, ...itemWithoutColumn } = item;

          acc[key] = itemWithoutColumn;

          return acc;
        },
        {},
      );
    }

    const queryBuilderOptions = referenceQueryBuilder.getFindOptions();
    const columnWithoutQuotes = column.replace(/["']/g, '');

    const result = await referenceQueryBuilder
      .setFindOptions({
        ...queryBuilderOptions,
        select: { ...queryBuilderOptions.select, [columnWithoutQuotes]: true },
      })
      .where(`${column} IN (:...ids)`, {
        ids,
      })
      .take(limit)
      .getMany();

    return { relationResults: result, relationAggregatedFieldsResult };
  }

  private assignRelationResults({
    parentRecords,
    parentObjectRecordsAggregatedValues,
    relationResults,
    relationAggregatedFieldsResult,
    sourceFieldName,
    joinField,
    joinColumnName,
    relationType,
    selectedFields,
  }: {
    parentRecords: ObjectRecord[];
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    parentObjectRecordsAggregatedValues: Record<string, any>;
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    relationResults: any[];
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    relationAggregatedFieldsResult: Record<string, any>;
    sourceFieldName: string;
    joinField: string;
    joinColumnName: string;
    relationType: RelationType;
    selectedFields: Record<string, unknown>;
  }): void {
    parentRecords.forEach((item) => {
      if (relationType === RelationType.ONE_TO_MANY) {
        item[sourceFieldName] = relationResults.filter(
          (rel) => rel[joinField] === item.id,
        );
      } else {
        const matchedRelation = relationResults.find(
          (rel) => rel.id === item[joinColumnName],
        );

        if (isDefined(matchedRelation?.deletedAt)) {
          item[sourceFieldName] = null;
          item[joinColumnName] = null;
        } else if (isDefined(matchedRelation)) {
          if (selectedFields?.deletedAt !== true) {
            const { deletedAt: _, ...rest } = matchedRelation;

            item[sourceFieldName] = rest;
          } else {
            item[sourceFieldName] = matchedRelation;
          }
        } else {
          item[sourceFieldName] = null;
        }
      }
    });

    parentObjectRecordsAggregatedValues[sourceFieldName] =
      relationAggregatedFieldsResult;
  }
}
