import {
  DataSource,
  FindManyOptions,
  FindOptionsRelations,
  In,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  getRelationMetadata,
  getRelationObjectMetadata,
} from 'src/engine/api/graphql/graphql-query-runner/utils/get-relation-object-metadata.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { deduceRelationDirection } from 'src/engine/utils/deduce-relation-direction.util';

export class ProcessNestedRelationsHelper {
  constructor() {}

  public async processNestedRelations<T extends ObjectRecord = ObjectRecord>(
    objectMetadataMaps: ObjectMetadataMaps,
    parentObjectMetadataItem: ObjectMetadataItemWithFieldMaps,
    parentObjectRecords: T[],
    relations: Record<string, FindOptionsRelations<ObjectLiteral>>,
    limit: number,
    authContext: any,
    dataSource: DataSource,
  ): Promise<void> {
    const processRelationTasks = Object.entries(relations).map(
      ([relationName, nestedRelations]) =>
        this.processRelation(
          objectMetadataMaps,
          parentObjectMetadataItem,
          parentObjectRecords,
          relationName,
          nestedRelations,
          limit,
          authContext,
          dataSource,
        ),
    );

    await Promise.all(processRelationTasks);
  }

  private async processRelation<T extends ObjectRecord = ObjectRecord>(
    objectMetadataMaps: ObjectMetadataMaps,
    parentObjectMetadataItem: ObjectMetadataItemWithFieldMaps,
    parentObjectRecords: T[],
    relationName: string,
    nestedRelations: any,
    limit: number,
    authContext: any,
    dataSource: DataSource,
  ): Promise<void> {
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

    await processor.call(
      this,
      objectMetadataMaps,
      parentObjectMetadataItem,
      parentObjectRecords,
      relationName,
      nestedRelations,
      limit,
      authContext,
      dataSource,
    );
  }

  private async processFromRelation<T extends ObjectRecord = ObjectRecord>(
    objectMetadataMaps: ObjectMetadataMaps,
    parentObjectMetadataItem: ObjectMetadataItemWithFieldMaps,
    parentObjectRecords: T[],
    relationName: string,
    nestedRelations: any,
    limit: number,
    authContext: any,
    dataSource: DataSource,
  ): Promise<void> {
    const { inverseRelationName, referenceObjectMetadata } =
      this.getRelationMetadata(
        objectMetadataMaps,
        parentObjectMetadataItem,
        relationName,
      );
    const relationRepository = dataSource.getRepository(
      referenceObjectMetadata.nameSingular,
    );

    const relationIds = this.getUniqueIds(parentObjectRecords, 'id');
    const relationResults = await this.findRelations(
      relationRepository,
      inverseRelationName,
      relationIds,
      limit * parentObjectRecords.length,
    );

    this.assignRelationResults(
      parentObjectRecords,
      relationResults,
      relationName,
      `${inverseRelationName}Id`,
    );

    if (Object.keys(nestedRelations).length > 0) {
      await this.processNestedRelations(
        objectMetadataMaps,
        objectMetadataMaps.byNameSingular[referenceObjectMetadata.nameSingular],
        relationResults as ObjectRecord[],
        nestedRelations as Record<string, FindOptionsRelations<ObjectLiteral>>,
        limit,
        authContext,
        dataSource,
      );
    }
  }

  private async processToRelation<T extends ObjectRecord = ObjectRecord>(
    objectMetadataMaps: ObjectMetadataMaps,
    parentObjectMetadataItem: ObjectMetadataItemWithFieldMaps,
    parentObjectRecords: T[],
    relationName: string,
    nestedRelations: any,
    limit: number,
    authContext: any,
    dataSource: DataSource,
  ): Promise<void> {
    const { referenceObjectMetadata } = this.getRelationMetadata(
      objectMetadataMaps,
      parentObjectMetadataItem,
      relationName,
    );
    const relationRepository = dataSource.getRepository(
      referenceObjectMetadata.nameSingular,
    );

    const relationIds = this.getUniqueIds(
      parentObjectRecords,
      `${relationName}Id`,
    );
    const relationResults = await this.findRelations(
      relationRepository,
      'id',
      relationIds,
      limit,
    );

    this.assignToRelationResults(
      parentObjectRecords,
      relationResults,
      relationName,
    );

    if (Object.keys(nestedRelations).length > 0) {
      await this.processNestedRelations(
        objectMetadataMaps,
        objectMetadataMaps.byNameSingular[referenceObjectMetadata.nameSingular],
        relationResults as ObjectRecord[],
        nestedRelations as Record<string, FindOptionsRelations<ObjectLiteral>>,
        limit,
        authContext,
        dataSource,
      );
    }
  }

  private getRelationMetadata(
    objectMetadataMaps: ObjectMetadataMaps,
    parentObjectMetadataItem: ObjectMetadataItemWithFieldMaps,
    relationName: string,
  ) {
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

  private getUniqueIds(records: ObjectRecord[], idField: string): any[] {
    return [...new Set(records.map((item) => item[idField]))];
  }

  private async findRelations(
    repository: Repository<any>,
    field: string,
    ids: any[],
    limit: number,
  ): Promise<any[]> {
    if (ids.length === 0) {
      return [];
    }
    const findOptions: FindManyOptions = {
      where: { [field]: In(ids) },
      take: limit,
    };

    return repository.find(findOptions);
  }

  private assignRelationResults(
    parentRecords: ObjectRecord[],
    relationResults: any[],
    relationName: string,
    joinField: string,
  ): void {
    parentRecords.forEach((item) => {
      (item as any)[relationName] = relationResults.filter(
        (rel) => rel[joinField] === item.id,
      );
    });
  }

  private assignToRelationResults(
    parentRecords: ObjectRecord[],
    relationResults: any[],
    relationName: string,
  ): void {
    parentRecords.forEach((item) => {
      if (relationResults.length === 0) {
        (item as any)[`${relationName}Id`] = null;
      }
      (item as any)[relationName] =
        relationResults.find((rel) => rel.id === item[`${relationName}Id`]) ??
        null;
    });
  }
}
