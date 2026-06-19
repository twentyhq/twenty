import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { resolveRelationFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-relation-from-flat-field-metadata.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';

const PERSON_OBJECT_NAME_SINGULAR = 'person';
const DEFAULT_MAX_RELATION_DEPTH_TO_PERSON = 3;

export type RelationHopToPerson = {
  direction: RelationType;
  queryObjectNameSingular: string;
  joinColumnName: string;
};

export type RelationPathToPerson = RelationHopToPerson[];

export const findRelationPathsToPerson = ({
  rootObjectNameSingular,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  maxDepth = DEFAULT_MAX_RELATION_DEPTH_TO_PERSON,
}: {
  rootObjectNameSingular: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  maxDepth?: number;
}): RelationPathToPerson[] => {
  if (rootObjectNameSingular === PERSON_OBJECT_NAME_SINGULAR) {
    return [[]];
  }

  const { idByNameSingular } = buildObjectIdByNameMaps(flatObjectMetadataMaps);
  const rootObjectId = idByNameSingular[rootObjectNameSingular];

  if (!isDefined(rootObjectId)) {
    return [];
  }

  let frontier = [{ objectId: rootObjectId, path: [] as RelationPathToPerson }];
  const visitedObjectIds = new Set<string>([rootObjectId]);
  const pathsToPerson: RelationPathToPerson[] = [];

  for (let depth = 0; depth < maxDepth; depth++) {
    const nextFrontier: typeof frontier = [];
    const objectIdsReachedThisDepth = new Set<string>();

    for (const { objectId, path } of frontier) {
      const sourceObject = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(sourceObject)) {
        continue;
      }

      for (const field of getFlatFieldsFromFlatObjectMetadata(
        sourceObject,
        flatFieldMetadataMaps,
      )) {
        if (!isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION)) {
          continue;
        }

        const relation = resolveRelationFromFlatFieldMetadata({
          sourceFlatFieldMetadata: field,
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
        });

        if (!isDefined(relation)) {
          continue;
        }

        const joinColumnOwner =
          relation.type === RelationType.MANY_TO_ONE
            ? {
                object: relation.sourceObjectMetadata,
                field: relation.sourceFieldMetadata,
              }
            : {
                object: relation.targetObjectMetadata,
                field: relation.targetFieldMetadata,
              };

        const nextPath: RelationPathToPerson = [
          ...path,
          {
            direction: relation.type,
            queryObjectNameSingular: joinColumnOwner.object.nameSingular,
            joinColumnName: computeMorphOrRelationFieldJoinColumnName({
              name: joinColumnOwner.field.name,
            }),
          },
        ];

        const targetObjectId = relation.targetObjectMetadata.id;

        if (
          relation.targetObjectMetadata.nameSingular ===
          PERSON_OBJECT_NAME_SINGULAR
        ) {
          pathsToPerson.push(nextPath);
        } else if (!visitedObjectIds.has(targetObjectId)) {
          objectIdsReachedThisDepth.add(targetObjectId);
          nextFrontier.push({ objectId: targetObjectId, path: nextPath });
        }
      }
    }

    objectIdsReachedThisDepth.forEach((id) => visitedObjectIds.add(id));
    frontier = nextFrontier;
  }

  return pathsToPerson;
};
