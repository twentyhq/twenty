import {
  DataSource,
  FindOptionsRelations,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import {
  getRelationMetadata,
  getRelationObjectMetadata,
} from 'src/engine/api/graphql/graphql-query-runner/utils/get-relation-object-metadata.util';
import { AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { deduceRelationDirection } from 'src/engine/utils/deduce-relation-direction.util';

export class ProcessNestedRelationsHelper {
  private processAggregateHelper: ProcessAggregateHelper;

  constructor() {
    this.processAggregateHelper = new ProcessAggregateHelper();
  }

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
    authContext: any;
    dataSource: DataSource;
  }): Promise<void> {
    const processRelationTasks = Object.entries(relations).map(
      ([relationName, nestedRelations]) =>
        this.processRelation({
          objectMetadataMaps,
          parentObjectMetadataItem,
          parentObjectRecords,
          parentObjectRecordsAggregatedValues,
          relationName,
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
    relationName,
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
    relationName: string;
    nestedRelations: any;
    aggregate: Record<string, AggregationField>;
    limit: number;
    authContext: any;
    dataSource: DataSource;
  }): Promise<void> {
    const relationFieldMetadata =
      parentObjectMetadataItem.fieldsByName[relationName];
    const relationMetadata = getRelationMetadata(relationFieldMetadata);
    const relationDirection = deduceRelationDirection(
      relationFieldMetadata,
      relationMetadata,
    );

    const processor =
      relationDirection === 'to'
        ? this.processToRelation
        : this.processFromRelation;

    await processor.call(this, {
      objectMetadataMaps,
      parentObjectMetadataItem,
      parentObjectRecords,
      parentObjectRecordsAggregatedValues,
      relationName,
      nestedRelations,
      aggregate,
      limit,
      authContext,
      dataSource,
    });
  }

  private async processFromRelation<T extends ObjectRecord = ObjectRecord>({
    objectMetadataMaps,
    parentObjectMetadataItem,
    parentObjectRecords,
    parentObjectRecordsAggregatedValues,
    relationName,
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
    relationName: string;
    nestedRelations: any;
    aggregate: Record<string, AggregationField>;
    limit: number;
    authContext: any;
    dataSource: DataSource;
  }): Promise<void> {
    const { inverseRelationName, referenceObjectMetadata } =
      this.getRelationMetadata({
        objectMetadataMaps,
        parentObjectMetadataItem,
        relationName,
      });
    const relationRepository = dataSource.getRepository(
      referenceObjectMetadata.nameSingular,
    );

    const referenceQueryBuilder = relationRepository.createQueryBuilder(
      referenceObjectMetadata.nameSingular,
    );

    const relationIds = this.getUniqueIds({
      records: parentObjectRecords,
      idField: 'id',
    });
    const { relationResults, relationAggregatedFieldsResult } =
      await this.findRelations({
        referenceQueryBuilder,
        column: `"${inverseRelationName}Id"`,
        ids: relationIds,
        limit: limit * parentObjectRecords.length,
        objectMetadataMaps,
        referenceObjectMetadata,
        aggregate,
        relationName,
      });

    this.assignFromRelationResults({
      parentRecords: parentObjectRecords,
      parentObjectRecordsAggregatedValues,
      relationResults,
      relationAggregatedFieldsResult,
      relationName,
      joinField: `${inverseRelationName}Id`,
    });

    const referenceObjectMetadataItemWithFieldsMaps =
      getObjectMetadataMapItemByNameSingular(
        objectMetadataMaps,
        referenceObjectMetadata.nameSingular,
      );

    if (!referenceObjectMetadataItemWithFieldsMaps) {
      throw new GraphqlQueryRunnerException(
        `Object ${referenceObjectMetadata.nameSingular} not found`,
        GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    if (Object.keys(nestedRelations).length > 0) {
      await this.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: referenceObjectMetadataItemWithFieldsMaps,
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

  private async processToRelation<T extends ObjectRecord = ObjectRecord>({
    objectMetadataMaps,
    parentObjectMetadataItem,
    parentObjectRecords,
    parentObjectRecordsAggregatedValues,
    relationName,
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
    relationName: string;
    nestedRelations: any;
    aggregate: Record<string, AggregationField>;
    limit: number;
    authContext: any;
    dataSource: DataSource;
  }): Promise<void> {
    const { referenceObjectMetadata } = this.getRelationMetadata({
      objectMetadataMaps,
      parentObjectMetadataItem,
      relationName,
    });
    const relationRepository = dataSource.getRepository(
      referenceObjectMetadata.nameSingular,
    );

    const referenceQueryBuilder = relationRepository.createQueryBuilder(
      referenceObjectMetadata.nameSingular,
    );

    const relationIds = this.getUniqueIds({
      records: parentObjectRecords,
      idField: `${relationName}Id`,
    });
    const { relationResults, relationAggregatedFieldsResult } =
      await this.findRelations({
        referenceQueryBuilder,
        column: 'id',
        ids: relationIds,
        limit,
        objectMetadataMaps,
        referenceObjectMetadata,
        aggregate,
        relationName,
      });

    this.assignToRelationResults({
      parentRecords: parentObjectRecords,
      parentObjectRecordsAggregatedValues: parentObjectRecordsAggregatedValues,
      relationResults,
      relationAggregatedFieldsResult,
      relationName,
    });

    const referenceObjectMetadataItemWithFieldsMaps =
      getObjectMetadataMapItemByNameSingular(
        objectMetadataMaps,
        referenceObjectMetadata.nameSingular,
      );

    if (!referenceObjectMetadataItemWithFieldsMaps) {
      throw new GraphqlQueryRunnerException(
        `Object ${referenceObjectMetadata.nameSingular} not found`,
        GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    if (Object.keys(nestedRelations).length > 0) {
      await this.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: referenceObjectMetadataItemWithFieldsMaps,
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

  private getRelationMetadata({
    objectMetadataMaps,
    parentObjectMetadataItem,
    relationName,
  }: {
    objectMetadataMaps: ObjectMetadataMaps;
    parentObjectMetadataItem: ObjectMetadataItemWithFieldMaps;
    relationName: string;
  }) {
    const relationFieldMetadata =
      parentObjectMetadataItem.fieldsByName[relationName];
    const relationMetadata = getRelationMetadata(relationFieldMetadata);
    const referenceObjectMetadata = getRelationObjectMetadata(
      relationFieldMetadata,
      objectMetadataMaps,
    );
    const inverseRelationName =
      objectMetadataMaps.byId[relationMetadata.toObjectMetadataId]?.fieldsById[
        relationMetadata.toFieldMetadataId
      ]?.name;

    return { inverseRelationName, referenceObjectMetadata };
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
    referenceObjectMetadata,
    aggregate,
    relationName,
  }: {
    referenceQueryBuilder: SelectQueryBuilder<any>;
    column: string;
    ids: any[];
    limit: number;
    objectMetadataMaps: ObjectMetadataMaps;
    referenceObjectMetadata: ObjectMetadataItemWithFieldMaps;
    aggregate: Record<string, any>;
    relationName: string;
  }): Promise<{ relationResults: any[]; relationAggregatedFieldsResult: any }> {
    if (ids.length === 0) {
      return { relationResults: [], relationAggregatedFieldsResult: {} };
    }

    const aggregateForRelation = aggregate[relationName];
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
      referenceObjectMetadata,
      objectMetadataMaps,
    );

    return { relationResults, relationAggregatedFieldsResult };
  }

  private assignFromRelationResults({
    parentRecords,
    parentObjectRecordsAggregatedValues,
    relationResults,
    relationAggregatedFieldsResult,
    relationName,
    joinField,
  }: {
    parentRecords: ObjectRecord[];
    parentObjectRecordsAggregatedValues: Record<string, any>;
    relationResults: any[];
    relationAggregatedFieldsResult: Record<string, any>;
    relationName: string;
    joinField: string;
  }): void {
    parentRecords.forEach((item) => {
      item[relationName] = relationResults.filter(
        (rel) => rel[joinField] === item.id,
      );
    });

    parentObjectRecordsAggregatedValues[relationName] =
      relationAggregatedFieldsResult;
  }

  private assignToRelationResults({
    parentRecords,
    parentObjectRecordsAggregatedValues,
    relationResults,
    relationAggregatedFieldsResult,
    relationName,
  }: {
    parentRecords: ObjectRecord[];
    parentObjectRecordsAggregatedValues: Record<string, any>;
    relationResults: any[];
    relationAggregatedFieldsResult: Record<string, any>;
    relationName: string;
  }): void {
    parentRecords.forEach((item) => {
      if (relationResults.length === 0) {
        item[`${relationName}Id`] = null;
      }
      item[relationName] =
        relationResults.find((rel) => rel.id === item[`${relationName}Id`]) ??
        null;
    });

    parentObjectRecordsAggregatedValues[relationName] =
      relationAggregatedFieldsResult;
  }
}
