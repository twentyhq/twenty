import {
  DataSource,
  FindManyOptions,
  FindOptionsRelations,
  In,
  ObjectLiteral,
} from 'typeorm';

import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import {
  getRelationMetadata,
  getRelationObjectMetadata,
} from 'src/engine/api/graphql/graphql-query-runner/utils/get-relation-object-metadata.util';
import {
  ObjectMetadataMap,
  ObjectMetadataMapItem,
} from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { deduceRelationDirection } from 'src/engine/utils/deduce-relation-direction.util';

export class ProcessNestedRelationsHelper {
  private readonly twentyORMGlobalManager: TwentyORMGlobalManager;

  constructor(twentyORMGlobalManager: TwentyORMGlobalManager) {
    this.twentyORMGlobalManager = twentyORMGlobalManager;
  }

  private async processFromRelation<ObjectRecord extends IRecord = IRecord>(
    objectMetadataMap: ObjectMetadataMap,
    parentObjectMetadataItem: ObjectMetadataMapItem,
    parentObjectRecords: ObjectRecord[],
    relationName: string,
    nestedRelations: any,
    limit: number,
    authContext: any,
    dataSource: DataSource,
  ) {
    const relationFieldMetadata = parentObjectMetadataItem.fields[relationName];
    const relationMetadata = getRelationMetadata(relationFieldMetadata);

    const inverseRelationName =
      objectMetadataMap[relationMetadata.toObjectMetadataId]?.fields[
        relationMetadata.toFieldMetadataId
      ]?.name;

    const referenceObjectMetadata = getRelationObjectMetadata(
      relationFieldMetadata,
      objectMetadataMap,
    );

    const referenceObjectMetadataName = referenceObjectMetadata.nameSingular;

    const relationRepository = await dataSource.getRepository(
      referenceObjectMetadataName,
    );

    const relationIds = parentObjectRecords.map((item) => item.id);

    const uniqueRelationIds = [...new Set(relationIds)];

    const relationFindOptions: FindManyOptions = {
      where: {
        [`${inverseRelationName}Id`]: In(uniqueRelationIds),
      },
      take: limit * parentObjectRecords.length,
    };

    const relationResults = await relationRepository.find(relationFindOptions);

    parentObjectRecords.forEach((item) => {
      (item as any)[relationName] = relationResults.filter(
        (rel) => rel[`${inverseRelationName}Id`] === item.id,
      );
    });

    if (Object.keys(nestedRelations).length > 0) {
      await this.processNestedRelations(
        objectMetadataMap,
        objectMetadataMap[relationName],
        relationResults as ObjectRecord[],
        nestedRelations as Record<string, FindOptionsRelations<ObjectLiteral>>,
        limit,
        authContext,
        dataSource,
      );
    }
  }

  private async processToRelation<ObjectRecord extends IRecord = IRecord>(
    objectMetadataMap: ObjectMetadataMap,
    parentObjectMetadataItem: ObjectMetadataMapItem,
    parentObjectRecords: ObjectRecord[],
    relationName: string,
    nestedRelations: any,
    limit: number,
    authContext: any,
    dataSource: DataSource,
  ) {
    const relationFieldMetadata = parentObjectMetadataItem.fields[relationName];

    const referenceObjectMetadata = getRelationObjectMetadata(
      relationFieldMetadata,
      objectMetadataMap,
    );

    const referenceObjectMetadataName = referenceObjectMetadata.nameSingular;

    const relationRepository = dataSource.getRepository(
      referenceObjectMetadataName,
    );

    const relationIds = parentObjectRecords.map(
      (item) => item[`${relationName}Id`],
    );

    const uniqueRelationIds = [...new Set(relationIds)];

    const relationFindOptions: FindManyOptions = {
      where: {
        id: In(uniqueRelationIds),
      },
      take: limit,
    };

    const relationResults = await relationRepository.find(relationFindOptions);

    parentObjectRecords.forEach((item) => {
      (item as any)[relationName] = relationResults.filter(
        (rel) => rel.id === item[`${relationName}Id`],
      )[0];
    });

    if (Object.keys(nestedRelations).length > 0) {
      await this.processNestedRelations(
        objectMetadataMap,
        objectMetadataMap[relationName],
        relationResults as ObjectRecord[],
        nestedRelations as Record<string, FindOptionsRelations<ObjectLiteral>>,
        limit,
        authContext,
        dataSource,
      );
    }
  }

  public async processNestedRelations<ObjectRecord extends IRecord = IRecord>(
    objectMetadataMap: ObjectMetadataMap,
    parentObjectMetadataItem: ObjectMetadataMapItem,
    parentObjectRecords: ObjectRecord[],
    relations: Record<string, FindOptionsRelations<ObjectLiteral>>,
    limit: number,
    authContext: any,
    dataSource: DataSource,
  ) {
    for (const [relationName, nestedRelations] of Object.entries(relations)) {
      const relationFieldMetadata =
        parentObjectMetadataItem.fields[relationName];
      const relationMetadata = getRelationMetadata(relationFieldMetadata);

      const relationDirection = deduceRelationDirection(
        relationFieldMetadata,
        relationMetadata,
      );

      if (relationDirection === 'to') {
        await this.processToRelation(
          objectMetadataMap,
          parentObjectMetadataItem,
          parentObjectRecords,
          relationName,
          nestedRelations,
          limit,
          authContext,
          dataSource,
        );
      } else {
        await this.processFromRelation(
          objectMetadataMap,
          parentObjectMetadataItem,
          parentObjectRecords,
          relationName,
          nestedRelations,
          limit,
          authContext,
          dataSource,
        );
      }
    }
  }
}
