import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';
import {
  DataSource,
  FindOptionsRelations,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { isFieldMetadataOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

@Injectable()
export class ProcessNestedRelationsV2Helper {
  constructor(
    private readonly processAggregateHelper: ProcessAggregateHelper,
  ) {}

  public async processNestedRelations<T extends ObjectRecord = ObjectRecord>({
    objectMetadataMaps,
    parentObjectMetadataItem,
    parentObjectRecords,
    parentObjectRecordsAggregatedValues = {},
    relations,
    aggregate = {},
    limit,
    authContext,
    dataSource,
  }: {
    objectMetadataMaps: ObjectMetadataMaps;
    parentObjectMetadataItem: ObjectMetadataItemWithFieldMaps;
    parentObjectRecords: T[];
    parentObjectRecordsAggregatedValues?: Record<string, any>;
    relations: Record<string, FindOptionsRelations<ObjectLiteral>>;
    aggregate?: Record<string, AggregationField>;
    limit: number;
    authContext: AuthContext;
    dataSource: DataSource;
  }): Promise<void> {
    const processRelationTasks = Object.entries(relations).map(
      ([sourceFieldName, nestedRelations]) =>
        this.processRelation({
          objectMetadataMaps,
          parentObjectMetadataItem,
          parentObjectRecords,
          parentObjectRecordsAggregatedValues,
          sourceFieldName,
          nestedRelations,
          aggregate,
          limit,
          authContext,
          dataSource,
        }),
    );

    await Promise.all(processRelationTasks);
  }

  private async processRelation<T extends ObjectRecord = ObjectRecord>({
    objectMetadataMaps,
    parentObjectMetadataItem,
    parentObjectRecords,
    parentObjectRecordsAggregatedValues,
    sourceFieldName,
    nestedRelations,
    aggregate,
    limit,
    authContext,
    dataSource,
  }: {
    objectMetadataMaps: ObjectMetadataMaps;
    parentObjectMetadataItem: ObjectMetadataItemWithFieldMaps;
    parentObjectRecords: T[];
    parentObjectRecordsAggregatedValues: Record<string, any>;
    sourceFieldName: string;
    nestedRelations: FindOptionsRelations<ObjectLiteral>;
    aggregate: Record<string, AggregationField>;
    limit: number;
    authContext: AuthContext;
    dataSource: DataSource;
  }): Promise<void> {
    const sourceFieldMetadata =
      parentObjectMetadataItem.fieldsByName[sourceFieldName];

    if (
      !isFieldMetadataOfType(sourceFieldMetadata, FieldMetadataType.RELATION)
    ) {
      // TODO: Maybe we should throw an error here ?
      return;
    }

    if (!sourceFieldMetadata.settings) {
      throw new GraphqlQueryRunnerException(
        `Relation settings not found for field ${sourceFieldName}`,
        GraphqlQueryRunnerExceptionCode.RELATION_SETTINGS_NOT_FOUND,
      );
    }

    const relationType = sourceFieldMetadata.settings?.relationType;
    const { targetRelationName, targetObjectMetadata } =
      this.getTargetObjectMetadata({
        objectMetadataMaps,
        parentObjectMetadataItem,
        sourceFieldName,
      });

    const targetObjectRepository = dataSource.getRepository(
      targetObjectMetadata.nameSingular,
    );
    const targetObjectQueryBuilder = targetObjectRepository.createQueryBuilder(
      targetObjectMetadata.nameSingular,
    );

    const relationIds = this.getUniqueIds({
      records: parentObjectRecords,
      idField:
        relationType === RelationType.ONE_TO_MANY
          ? 'id'
          : `${sourceFieldName}Id`,
    });

    const { relationResults, relationAggregatedFieldsResult } =
      await this.findRelations({
        referenceQueryBuilder: targetObjectQueryBuilder,
        column:
          relationType === RelationType.ONE_TO_MANY
            ? `"${targetRelationName}Id"`
            : 'id',
        ids: relationIds,
        limit,
        objectMetadataMaps,
        targetObjectMetadata,
        aggregate,
        sourceFieldName,
      });

    this.assignRelationResults({
      parentRecords: parentObjectRecords,
      parentObjectRecordsAggregatedValues,
      relationResults,
      relationAggregatedFieldsResult,
      sourceFieldName,
      joinField:
        relationType === RelationType.ONE_TO_MANY
          ? `${targetRelationName}Id`
          : 'id',
      relationType,
    });

    const targetObjectMetadataItemWithFieldsMaps =
      getObjectMetadataMapItemByNameSingular(
        objectMetadataMaps,
        targetObjectMetadata.nameSingular,
      );

    if (!targetObjectMetadataItemWithFieldsMaps) {
      throw new GraphqlQueryRunnerException(
        `Object ${targetObjectMetadata.nameSingular} not found`,
        GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    if (Object.keys(nestedRelations).length > 0) {
      await this.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: targetObjectMetadataItemWithFieldsMaps,
        parentObjectRecords: relationResults as ObjectRecord[],
        parentObjectRecordsAggregatedValues: relationAggregatedFieldsResult,
        relations: nestedRelations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        aggregate,
        limit,
        authContext,
        dataSource,
      });
    }
  }

  private getTargetObjectMetadata({
    objectMetadataMaps,
    parentObjectMetadataItem,
    sourceFieldName,
  }: {
    objectMetadataMaps: ObjectMetadataMaps;
    parentObjectMetadataItem: ObjectMetadataItemWithFieldMaps;
    sourceFieldName: string;
  }) {
    const targetFieldMetadata =
      parentObjectMetadataItem.fieldsByName[sourceFieldName];
    const targetObjectMetadata = getTargetObjectMetadataOrThrow(
      targetFieldMetadata,
      objectMetadataMaps,
    );

    if (
      !targetFieldMetadata.relationTargetObjectMetadataId ||
      !targetFieldMetadata.relationTargetFieldMetadataId
    ) {
      throw new GraphqlQueryRunnerException(
        `Relation target object metadata id or field metadata id not found for field ${sourceFieldName}`,
        GraphqlQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND,
      );
    }

    const targetRelationName =
      objectMetadataMaps.byId[
        targetFieldMetadata.relationTargetObjectMetadataId
      ]?.fieldsById[targetFieldMetadata.relationTargetFieldMetadataId]?.name;

    return { targetRelationName, targetObjectMetadata };
  }

  private getUniqueIds({
    records,
    idField,
  }: {
    records: ObjectRecord[];
    idField: string;
  }): any[] {
    return [...new Set(records.map((item) => item[idField]))];
  }

  private async findRelations({
    referenceQueryBuilder,
    column,
    ids,
    limit,
    objectMetadataMaps,
    targetObjectMetadata,
    aggregate,
    sourceFieldName,
  }: {
    referenceQueryBuilder: SelectQueryBuilder<any>;
    column: string;
    ids: any[];
    limit: number;
    objectMetadataMaps: ObjectMetadataMaps;
    targetObjectMetadata: ObjectMetadataItemWithFieldMaps;
    aggregate: Record<string, any>;
    sourceFieldName: string;
  }): Promise<{ relationResults: any[]; relationAggregatedFieldsResult: any }> {
    if (ids.length === 0) {
      return { relationResults: [], relationAggregatedFieldsResult: {} };
    }

    const aggregateForRelation = aggregate[sourceFieldName];
    let relationAggregatedFieldsResult: Record<string, any> = {};

    if (aggregateForRelation) {
      const aggregateQueryBuilder = referenceQueryBuilder.clone();

      this.processAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder(
        {
          selectedAggregatedFields: aggregateForRelation,
          queryBuilder: aggregateQueryBuilder,
        },
      );

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

    const result = await referenceQueryBuilder
      .where(`${column} IN (:...ids)`, {
        ids,
      })
      .take(limit)
      .getMany();

    const relationResults = formatResult<ObjectRecord[]>(
      result,
      targetObjectMetadata,
      objectMetadataMaps,
    );

    return { relationResults, relationAggregatedFieldsResult };
  }

  private assignRelationResults({
    parentRecords,
    parentObjectRecordsAggregatedValues,
    relationResults,
    relationAggregatedFieldsResult,
    sourceFieldName,
    joinField,
    relationType,
  }: {
    parentRecords: ObjectRecord[];
    parentObjectRecordsAggregatedValues: Record<string, any>;
    relationResults: any[];
    relationAggregatedFieldsResult: Record<string, any>;
    sourceFieldName: string;
    joinField: string;
    relationType: RelationType;
  }): void {
    parentRecords.forEach((item) => {
      if (relationType === RelationType.ONE_TO_MANY) {
        item[sourceFieldName] = relationResults.filter(
          (rel) => rel[joinField] === item.id,
        );
      } else {
        if (relationResults.length === 0) {
          item[`${sourceFieldName}Id`] = null;
        }
        item[sourceFieldName] =
          relationResults.find(
            (rel) => rel.id === item[`${sourceFieldName}Id`],
          ) ?? null;
      }
    });

    parentObjectRecordsAggregatedValues[sourceFieldName] =
      relationAggregatedFieldsResult;
  }
}
