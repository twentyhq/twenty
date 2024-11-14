import {
  DataSource,
  FindOptionsRelations,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import {
  getRelationMetadata,
  getRelationObjectMetadata,
} from 'src/engine/api/graphql/graphql-query-runner/utils/get-relation-object-metadata.util';
import { AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
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
    parentObjectRecordsAggregatedFields = {},
    relations,
    aggregate = {},
    limit,
    authContext,
    dataSource,
  }: {
    objectMetadataMaps: ObjectMetadataMaps;
    parentObjectMetadataItem: ObjectMetadataItemWithFieldMaps;
    parentObjectRecords: T[];
    parentObjectRecordsAggregatedFields?: Record<string, any>;
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
          parentObjectRecordsAggregatedFields,
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
    parentObjectRecordsAggregatedFields,
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
    parentObjectRecordsAggregatedFields: Record<string, any>;
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
      parentObjectRecordsAggregatedFields,
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
    parentObjectRecordsAggregatedFields,
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
    parentObjectRecordsAggregatedFields: Record<string, any>;
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

    const queryBuilder = relationRepository.createQueryBuilder(
      referenceObjectMetadata.nameSingular,
    );

    const relationIds = this.getUniqueIds({
      records: parentObjectRecords,
      idField: 'id',
    });
    const { relationResults, relationAggregatedFieldsResult } =
      await this.findRelations({
        queryBuilder,
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
      parentObjectRecordsAggregatedFields,
      relationResults,
      relationAggregatedFieldsResult,
      relationName,
      joinField: `${inverseRelationName}Id`,
    });

    if (Object.keys(nestedRelations).length > 0) {
      await this.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem:
          objectMetadataMaps.byNameSingular[
            referenceObjectMetadata.nameSingular
          ],
        parentObjectRecords: relationResults as ObjectRecord[],
        parentObjectRecordsAggregatedFields: relationAggregatedFieldsResult,
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
    parentObjectRecordsAggregatedFields,
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
    parentObjectRecordsAggregatedFields: Record<string, any>;
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

    const queryBuilder = relationRepository.createQueryBuilder(
      referenceObjectMetadata.nameSingular,
    );

    const relationIds = this.getUniqueIds({
      records: parentObjectRecords,
      idField: `${relationName}Id`,
    });
    const { relationResults, relationAggregatedFieldsResult } =
      await this.findRelations({
        queryBuilder,
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
      parentObjectRecordsAggregatedFields,
      relationResults,
      relationAggregatedFieldsResult,
      relationName,
    });

    if (Object.keys(nestedRelations).length > 0) {
      await this.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem:
          objectMetadataMaps.byNameSingular[
            referenceObjectMetadata.nameSingular
          ],
        parentObjectRecords: relationResults as ObjectRecord[],
        parentObjectRecordsAggregatedFields: relationAggregatedFieldsResult,
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
    queryBuilder,
    column,
    ids,
    limit,
    objectMetadataMaps,
    referenceObjectMetadata,
    aggregate,
    relationName,
  }: {
    queryBuilder: SelectQueryBuilder<any>;
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
    let relationAggregatedFieldsResult = {};

    if (aggregateForRelation) {
      const aggregateQueryBuilder = queryBuilder.clone();

      this.processAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder(
        {
          fieldMetadataMapByName: referenceObjectMetadata.fieldsByName,
          selectedAggregatedFields: aggregateForRelation,
          queryBuilder: aggregateQueryBuilder,
        },
      );

      relationAggregatedFieldsResult =
        (await aggregateQueryBuilder.getRawOne()) ?? {};
    }

    const result = await queryBuilder
      .where(`${column} IN (:...ids)`, {
        ids,
      })
      .take(limit)
      .getMany();

    const relationResults = formatResult(
      result,
      referenceObjectMetadata,
      objectMetadataMaps,
    );

    return { relationResults, relationAggregatedFieldsResult };
  }

  private assignFromRelationResults({
    parentRecords,
    parentObjectRecordsAggregatedFields,
    relationResults,
    relationAggregatedFieldsResult,
    relationName,
    joinField,
  }: {
    parentRecords: ObjectRecord[];
    parentObjectRecordsAggregatedFields: Record<string, any>;
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

    parentObjectRecordsAggregatedFields[relationName] =
      relationAggregatedFieldsResult;
  }

  private assignToRelationResults({
    parentRecords,
    parentObjectRecordsAggregatedFields,
    relationResults,
    relationAggregatedFieldsResult,
    relationName,
  }: {
    parentRecords: ObjectRecord[];
    parentObjectRecordsAggregatedFields: Record<string, any>;
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

    parentObjectRecordsAggregatedFields[relationName] =
      relationAggregatedFieldsResult;
  }
}
