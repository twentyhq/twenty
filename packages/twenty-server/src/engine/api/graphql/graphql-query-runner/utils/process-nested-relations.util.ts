import {
  FindManyOptions,
  FindOptionsRelations,
  In,
  ObjectLiteral,
} from 'typeorm';

import {
  getRelationMetadata,
  getRelationObjectMetadata,
} from 'src/engine/api/graphql/graphql-query-runner/utils/get-relation-object-metadata.util';
import {
  ObjectMetadataMap,
  ObjectMetadataMapItem,
} from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { deduceRelationDirection } from 'src/engine/utils/deduce-relation-direction.util';

export const processFromRelation = async <
  ObjectRecord extends IRecord = IRecord,
>(
  objectMetadataMap: ObjectMetadataMap,
  parentObjectMetadataItem: ObjectMetadataMapItem,
  parentObjectRecords: ObjectRecord[],
  relationName: string,
  nestedRelations: any,
  limit: number,
  authContext: any,
  twentyORMGlobalManager: any,
) => {
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

  const relationRepository =
    await twentyORMGlobalManager.getRepositoryForWorkspace(
      authContext.workspace.id,
      referenceObjectMetadataName,
    );

  const relationIds = parentObjectRecords.map((item) => item.id);

  const uniqueRelationIds = [...new Set(relationIds)];

  const relationFindOptions: FindManyOptions = {
    where: {
      [`${inverseRelationName}Id`]: In(uniqueRelationIds),
    },
    take: limit,
  };

  const relationResults = await relationRepository.find(relationFindOptions);

  parentObjectRecords.forEach((item) => {
    (item as any)[relationName] = relationResults.filter(
      (rel) => rel[`${inverseRelationName}Id`] === item.id,
    );
  });

  if (Object.keys(nestedRelations).length > 0) {
    await processNestedRelations(
      objectMetadataMap,
      objectMetadataMap[relationName],
      relationResults as ObjectRecord[],
      nestedRelations as Record<string, FindOptionsRelations<ObjectLiteral>>,
      limit,
      authContext,
      twentyORMGlobalManager,
    );
  }
};

export const processToRelation = async <ObjectRecord extends IRecord = IRecord>(
  objectMetadataMap: ObjectMetadataMap,
  parentObjectMetadataItem: ObjectMetadataMapItem,
  parentObjectRecords: ObjectRecord[],
  relationName: string,
  nestedRelations: any,
  limit: number,
  authContext: any,
  twentyORMGlobalManager: any,
) => {
  const relationFieldMetadata = parentObjectMetadataItem.fields[relationName];

  const referenceObjectMetadata = getRelationObjectMetadata(
    relationFieldMetadata,
    objectMetadataMap,
  );

  const referenceObjectMetadataName = referenceObjectMetadata.nameSingular;

  const relationRepository =
    await twentyORMGlobalManager.getRepositoryForWorkspace(
      authContext.workspace.id,
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
    await processNestedRelations(
      objectMetadataMap,
      objectMetadataMap[relationName],
      relationResults as ObjectRecord[],
      nestedRelations as Record<string, FindOptionsRelations<ObjectLiteral>>,
      limit,
      authContext,
      twentyORMGlobalManager,
    );
  }
};

export const processNestedRelations = async <
  ObjectRecord extends IRecord = IRecord,
>(
  objectMetadataMap: ObjectMetadataMap,
  parentObjectMetadataItem: ObjectMetadataMapItem,
  parentObjectRecords: ObjectRecord[],
  relations: Record<string, FindOptionsRelations<ObjectLiteral>>,
  limit: number,
  authContext: any,
  twentyORMGlobalManager: any,
) => {
  for (const [relationName, nestedRelations] of Object.entries(relations)) {
    const relationFieldMetadata = parentObjectMetadataItem.fields[relationName];
    const relationMetadata = getRelationMetadata(relationFieldMetadata);

    const relationDirection = deduceRelationDirection(
      relationFieldMetadata,
      relationMetadata,
    );

    if (relationDirection === 'to') {
      await processToRelation(
        objectMetadataMap,
        parentObjectMetadataItem,
        parentObjectRecords,
        relationName,
        nestedRelations,
        limit,
        authContext,
        twentyORMGlobalManager,
      );
    } else {
      await processFromRelation(
        objectMetadataMap,
        parentObjectMetadataItem,
        parentObjectRecords,
        relationName,
        nestedRelations,
        limit,
        authContext,
        twentyORMGlobalManager,
      );
    }
  }
};
