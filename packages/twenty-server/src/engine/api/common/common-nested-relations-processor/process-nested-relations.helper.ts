import { Injectable } from '@nestjs/common';

import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isEmptyObject, isValidUuid } from 'twenty-shared/utils';
import { type FindOptionsRelations, type ObjectLiteral } from 'typeorm';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type NestedRelationQueryArgs } from 'src/engine/api/common/common-nested-relations-processor/types/nested-relation-query-args.type';
import { type NestedRelationQueryArgsByFieldName } from 'src/engine/api/common/common-nested-relations-processor/types/nested-relation-query-args-by-field-name.type';
import {
  type ConcurrencyLimiter,
  createConcurrencyLimiter,
} from 'src/engine/api/common/common-nested-relations-processor/utils/create-concurrency-limiter.util';
import { assignManyToOneRelationRecords } from 'src/engine/api/common/common-nested-relations-processor/utils/assign-many-to-one-relation-records.util';
import { assignOneToManyRelationRecords } from 'src/engine/api/common/common-nested-relations-processor/utils/assign-one-to-many-relation-records.util';
import { getUniqueRelationIds } from 'src/engine/api/common/common-nested-relations-processor/utils/get-unique-relation-ids.util';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import {
  buildFieldMapsFromFlatObjectMetadata,
  type FieldMapsForObject,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

const EMPTY_RELATION_SENTINEL_RECORD_ID =
  '00000000-0000-0000-0000-000000000000';
const NESTED_RELATION_QUERY_MAX_CONCURRENCY = 4;

type ProcessNestedRelationsArgs<T extends ObjectRecord = ObjectRecord> = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  parentObjectMetadataItem: FlatObjectMetadata;
  parentObjectRecords: T[];
  // oxlint-disable-next-line typescript/no-explicit-any
  parentObjectRecordsAggregatedValues?: Record<string, any>;
  relations: Record<string, FindOptionsRelations<ObjectLiteral>>;
  aggregate?: Record<string, AggregationField>;
  limit: number;
  authContext: WorkspaceAuthContext;
  useReplica?: boolean;
  repository?: WorkspaceRepository;
  // oxlint-disable-next-line typescript/no-explicit-any
  selectedFields: Record<string, any>;
  nestedRelationQueryArgsByFieldName?: NestedRelationQueryArgsByFieldName;
};

@Injectable()
export class ProcessNestedRelationsHelper {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  public async processNestedRelations<T extends ObjectRecord = ObjectRecord>(
    args: ProcessNestedRelationsArgs<T>,
  ): Promise<void> {
    await this.processNestedRelationsWithLimiter(
      args,
      createConcurrencyLimiter(NESTED_RELATION_QUERY_MAX_CONCURRENCY),
    );
  }

  private async processNestedRelationsWithLimiter<
    T extends ObjectRecord = ObjectRecord,
  >(
    {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      parentObjectMetadataItem,
      parentObjectRecords,
      parentObjectRecordsAggregatedValues = {},
      relations,
      aggregate = {},
      limit,
      authContext,
      useReplica = false,
      repository,
      selectedFields,
      nestedRelationQueryArgsByFieldName = {},
    }: ProcessNestedRelationsArgs<T>,
    relationQueryLimiter: ConcurrencyLimiter,
  ): Promise<void> {
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
          useReplica,
          repository,
          relationQueryLimiter,
          selectedFields:
            selectedFields[sourceFieldName] instanceof Object
              ? selectedFields[sourceFieldName]
              : undefined,
          relationQueryArgs:
            nestedRelationQueryArgsByFieldName[sourceFieldName],
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
    useReplica,
    repository,
    relationQueryLimiter,
    selectedFields,
    relationQueryArgs,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    parentObjectMetadataItem: FlatObjectMetadata;
    parentObjectRecords: T[];
    // oxlint-disable-next-line typescript/no-explicit-any
    parentObjectRecordsAggregatedValues: Record<string, any>;
    sourceFieldName: string;
    nestedRelations: FindOptionsRelations<ObjectLiteral>;
    // Mixes this level's aggregation fields with each nested relation's own map
    // oxlint-disable-next-line typescript/no-explicit-any
    aggregate: Record<string, any>;
    limit: number;
    authContext: WorkspaceAuthContext;
    useReplica: boolean;
    repository?: WorkspaceRepository;
    relationQueryLimiter: ConcurrencyLimiter;
    selectedFields: Record<string, unknown>;
    relationQueryArgs?: NestedRelationQueryArgs;
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
      return;
    }

    if (!sourceFieldMetadata.settings) {
      throw new GraphqlQueryRunnerException(
        `Relation settings not found for field ${sourceFieldName}`,
        GraphqlQueryRunnerExceptionCode.RELATION_SETTINGS_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const relationType = sourceFieldMetadata.settings.relationType;
    const { targetRelationName, targetObjectMetadata, targetRelation } =
      this.getTargetObjectMetadata({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem,
        sourceFieldName,
        fieldMaps,
      });

    const targetObjectRepository = repository
      ? repository.getRepositoryForObjectMetadataId(targetObjectMetadata.id)
      : this.workspaceOrmManager.getRepository(
          targetObjectMetadata.nameSingular,
          { useReplica },
        );

    const targetObjectNameSingular = targetObjectMetadata.nameSingular;

    // A joined relation to such records reads as empty, so a nested one does too instead of failing the parent
    if (await targetObjectRepository.isReadDisabled()) {
      this.assignRelationResults({
        parentRecords: parentObjectRecords,
        parentObjectRecordsAggregatedValues,
        relationResults: [],
        relationAggregatedFieldsResult: {},
        sourceFieldName,
        relatedRecordJoinColumnName: 'id',
        parentRecordJoinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: sourceFieldName,
        }),
        relationType,
        selectedFields,
      });

      return;
    }

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

    const relationIds = getUniqueRelationIds({
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
      await relationQueryLimiter(() =>
        this.findRelations({
          referenceQueryBuilder: targetObjectQueryBuilder,
          targetObjectRepository,
          column:
            relationType === RelationType.ONE_TO_MANY
              ? `"${fieldMetadataTargetRelationColumnName}"`
              : 'id',
          ids: relationIds,
          relationType,
          parentRecordsCount: parentObjectRecords.length,
          aggregate,
          sourceFieldName,
          targetObjectNameSingular,
          relationQueryArgs,
          relationQueryParser: new GraphqlQueryParser(
            targetObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          ),
          perParentLimit: Math.min(relationQueryArgs?.first ?? limit, limit),
        }),
      );

    if (Object.keys(nestedRelations).length > 0) {
      await this.processNestedRelationsWithLimiter(
        {
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          parentObjectMetadataItem: targetObjectMetadata,
          parentObjectRecords: relationResults as ObjectRecord[],
          parentObjectRecordsAggregatedValues: relationAggregatedFieldsResult,
          relations: nestedRelations as Record<
            string,
            FindOptionsRelations<ObjectLiteral>
          >,
          aggregate: aggregate[sourceFieldName] ?? {},
          limit,
          authContext,
          useReplica,
          repository,
          selectedFields,
          nestedRelationQueryArgsByFieldName:
            relationQueryArgs?.nestedRelationQueryArgsByFieldName,
        },
        relationQueryLimiter,
      );
    }

    // After the nested load: a to-one relation is assigned as a copy, so nested rows must already be on it
    this.assignRelationResults({
      parentRecords: parentObjectRecords,
      parentObjectRecordsAggregatedValues,
      relationResults,
      relationAggregatedFieldsResult,
      sourceFieldName,
      relatedRecordJoinColumnName:
        relationType === RelationType.ONE_TO_MANY
          ? `${fieldMetadataTargetRelationColumnName}`
          : 'id',
      parentRecordJoinColumnName: joinColumnName,
      relationType,
      selectedFields,
    });
  }

  private getTargetObjectMetadata({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    parentObjectMetadataItem,
    sourceFieldName,
    fieldMaps,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
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

  private async findRelations({
    referenceQueryBuilder,
    targetObjectRepository,
    column,
    ids,
    relationType,
    perParentLimit,
    parentRecordsCount,
    aggregate,
    sourceFieldName,
    targetObjectNameSingular,
    relationQueryArgs,
    relationQueryParser,
  }: {
    referenceQueryBuilder: WorkspaceSelectQueryBuilder;
    targetObjectRepository: WorkspaceRepository;
    column: string;
    // oxlint-disable-next-line typescript/no-explicit-any
    ids: any[];
    relationType: RelationType;
    perParentLimit: number;
    parentRecordsCount: number;
    // oxlint-disable-next-line typescript/no-explicit-any
    aggregate: Record<string, any>;
    sourceFieldName: string;
    targetObjectNameSingular: string;
    relationQueryArgs?: NestedRelationQueryArgs;
    relationQueryParser: GraphqlQueryParser;
    // oxlint-disable-next-line typescript/no-explicit-any
  }): Promise<{ relationResults: any[]; relationAggregatedFieldsResult: any }> {
    if (ids.length === 0) {
      return { relationResults: [], relationAggregatedFieldsResult: {} };
    }

    // Qualified so a relation join added by orderBy or filter can't make it ambiguous
    const qualifiedColumn = `"${targetObjectNameSingular}".${column}`;
    const aggregateForRelation = aggregate[sourceFieldName];
    // oxlint-disable-next-line typescript/no-explicit-any
    let relationAggregatedFieldsResult: Record<string, any> = {};

    if (
      isDefined(aggregateForRelation) &&
      !isEmptyObject(aggregateForRelation)
    ) {
      const aggregateQueryBuilder = referenceQueryBuilder.clone();

      this.applyNestedRelationFilterToBuilder({
        queryBuilder: aggregateQueryBuilder,
        targetObjectNameSingular,
        relationQueryArgs,
        relationQueryParser,
      });

      ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
        selectedAggregatedFields: aggregateForRelation,
        queryBuilder: aggregateQueryBuilder,
        objectMetadataNameSingular: targetObjectNameSingular,
      });

      const aggregatedFieldsValues = await aggregateQueryBuilder
        .addSelect(qualifiedColumn, column.replace(/["']/g, ''))
        .andWhere(`${qualifiedColumn} IN (:...ids)`, { ids })
        .groupBy(qualifiedColumn)
        .getRawMany();

      relationAggregatedFieldsResult = aggregatedFieldsValues.reduce<
        Record<string, unknown>
      >((acc, item) => {
        const columnWithoutQuotes = column.replace(/["']/g, '');
        const key = String(item[columnWithoutQuotes]);
        const { [column]: _, ...itemWithoutColumn } = item;

        acc[key] = itemWithoutColumn;

        return acc;
      }, {});
    }

    const queryBuilderOptions = referenceQueryBuilder.getFindOptions();
    const columnWithoutQuotes = column.replace(/["']/g, '');

    const findOptionsWithJoinColumn = {
      ...queryBuilderOptions,
      select: { ...queryBuilderOptions.select, [columnWithoutQuotes]: true },
    };

    if (relationType !== RelationType.ONE_TO_MANY) {
      const result = await referenceQueryBuilder
        .setFindOptions(findOptionsWithJoinColumn)
        .where(`${qualifiedColumn} IN (:...ids)`, { ids })
        .take(perParentLimit * parentRecordsCount)
        .getMany();

      return { relationResults: result, relationAggregatedFieldsResult };
    }

    const allowedRelationRecordIds =
      await this.findRelationRecordIdsLimitedPerParent({
        targetObjectRepository,
        targetObjectNameSingular,
        column,
        ids,
        perParentLimit,
        relationQueryArgs,
        relationQueryParser,
      });

    const recordIdsToHydrate =
      allowedRelationRecordIds.length > 0
        ? allowedRelationRecordIds
        : [EMPTY_RELATION_SENTINEL_RECORD_ID];

    const hydrationQueryBuilder = referenceQueryBuilder
      .setFindOptions(findOptionsWithJoinColumn)
      .where(`"${targetObjectNameSingular}"."id" IN (:...recordIdsToHydrate)`, {
        recordIdsToHydrate,
      });

    // The id query may have kept soft-deleted records the filter asked for
    if (isDefined(relationQueryArgs?.filter)) {
      relationQueryParser.applyDeletedAtToBuilder(
        hydrationQueryBuilder,
        relationQueryArgs.filter,
      );
    }

    if (isDefined(relationQueryArgs?.orderBy)) {
      relationQueryParser.applyOrderToBuilder(
        hydrationQueryBuilder,
        relationQueryArgs.orderBy,
        targetObjectNameSingular,
      );
    }

    const result = await hydrationQueryBuilder.getMany();

    return { relationResults: result, relationAggregatedFieldsResult };
  }

  private async findRelationRecordIdsLimitedPerParent({
    targetObjectRepository,
    targetObjectNameSingular,
    column,
    ids,
    perParentLimit,
    relationQueryArgs,
    relationQueryParser,
  }: {
    targetObjectRepository: WorkspaceRepository;
    targetObjectNameSingular: string;
    column: string;
    ids: string[];
    perParentLimit: number;
    relationQueryArgs?: NestedRelationQueryArgs;
    relationQueryParser: GraphqlQueryParser;
  }): Promise<string[]> {
    const sanitizedIds = ids.filter(isValidUuid);

    if (sanitizedIds.length === 0) {
      return [];
    }

    const perParentRecordIdsQueryBuilder = targetObjectRepository
      .createQueryBuilder(targetObjectNameSingular)
      .select(`"${targetObjectNameSingular}"."id"`, 'id');

    this.applyNestedRelationFilterToBuilder({
      queryBuilder: perParentRecordIdsQueryBuilder,
      targetObjectNameSingular,
      relationQueryArgs,
      relationQueryParser,
    });

    perParentRecordIdsQueryBuilder.andWhere(
      `"${targetObjectNameSingular}".${column} = "lateralParents"."parentId"`,
    );

    if (isDefined(relationQueryArgs?.orderBy)) {
      relationQueryParser.applyOrderToBuilder(
        perParentRecordIdsQueryBuilder,
        relationQueryArgs.orderBy,
        targetObjectNameSingular,
      );
    }

    await perParentRecordIdsQueryBuilder.applyRowLevelPermissions();

    const perParentRecordIdsSql = `${perParentRecordIdsQueryBuilder.getQuery()} LIMIT ${Number(perParentLimit)}`;

    const parentValues = sanitizedIds.map((id) => `('${id}'::uuid)`).join(', ');

    const lateralSql =
      `SELECT "limited_relation_records"."id" AS "id" FROM (` +
      `SELECT "lateralRecords"."id" AS "id" ` +
      `FROM (VALUES ${parentValues}) AS "lateralParents"("parentId") ` +
      `CROSS JOIN LATERAL (${perParentRecordIdsSql}) AS "lateralRecords"` +
      `) AS "limited_relation_records"`;

    const limitedRecords = await targetObjectRepository.executeRaw<{
      id: string;
    }>(lateralSql, perParentRecordIdsQueryBuilder.getParameters());

    return limitedRecords.map((limitedRecord) => limitedRecord.id);
  }

  private applyNestedRelationFilterToBuilder({
    queryBuilder,
    targetObjectNameSingular,
    relationQueryArgs,
    relationQueryParser,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    targetObjectNameSingular: string;
    relationQueryArgs?: NestedRelationQueryArgs;
    relationQueryParser: GraphqlQueryParser;
  }): void {
    if (!isDefined(relationQueryArgs?.filter)) {
      return;
    }

    relationQueryParser.applyFilterToBuilder(
      queryBuilder,
      targetObjectNameSingular,
      relationQueryArgs.filter,
    );
    relationQueryParser.applyDeletedAtToBuilder(
      queryBuilder,
      relationQueryArgs.filter,
    );
  }

  private assignRelationResults({
    parentRecords,
    parentObjectRecordsAggregatedValues,
    relationResults,
    relationAggregatedFieldsResult,
    sourceFieldName,
    relatedRecordJoinColumnName,
    parentRecordJoinColumnName,
    relationType,
    selectedFields,
  }: {
    parentRecords: ObjectRecord[];
    // oxlint-disable-next-line typescript/no-explicit-any
    parentObjectRecordsAggregatedValues: Record<string, any>;
    // oxlint-disable-next-line typescript/no-explicit-any
    relationResults: any[];
    // oxlint-disable-next-line typescript/no-explicit-any
    relationAggregatedFieldsResult: Record<string, any>;
    sourceFieldName: string;
    relatedRecordJoinColumnName: string;
    parentRecordJoinColumnName: string;
    relationType: RelationType;
    selectedFields: Record<string, unknown>;
  }): void {
    if (relationType === RelationType.ONE_TO_MANY) {
      assignOneToManyRelationRecords({
        parentRecords,
        relationRecords: relationResults,
        sourceFieldName,
        relatedRecordJoinColumnName,
      });
    } else {
      assignManyToOneRelationRecords({
        parentRecords,
        relationRecords: relationResults,
        sourceFieldName,
        parentRecordJoinColumnName,
        selectedFields,
      });
    }

    parentObjectRecordsAggregatedValues[sourceFieldName] =
      relationAggregatedFieldsResult;
  }
}
