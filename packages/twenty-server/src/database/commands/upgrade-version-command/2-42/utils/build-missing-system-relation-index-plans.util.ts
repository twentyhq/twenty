import { getIndexUniversalIdentifier } from 'twenty-shared/application';
import {
  type DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { FieldMetadataType, IndexType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { isManyToOneFlatFieldMetadata } from 'src/engine/twenty-orm/utils/is-many-to-one-flat-field-metadata.util';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export type SystemRelationHolderNameSingular =
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number];

export type MissingSystemRelationIndexPlan = {
  holderFlatObjectMetadata: FlatObjectMetadata;
  joinColumnName: string;
  universalFlatIndexMetadata: UniversalFlatIndexMetadata;
};

type BuildMissingSystemRelationIndexPlansArgs = Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatIndexMaps'
> & {
  holderFlatObjectMetadataByNameSingular: Record<
    SystemRelationHolderNameSingular,
    FlatObjectMetadata
  >;
  twentyStandardApplicationUniversalIdentifier: string;
  now: string;
};

const collectLeadingIndexedFieldMetadataIds = ({
  flatIndexMaps,
  objectMetadataId,
}: Pick<BuildMissingSystemRelationIndexPlansArgs, 'flatIndexMaps'> & {
  objectMetadataId: string;
}): Set<string> =>
  new Set(
    Object.values(flatIndexMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((flatIndex) => flatIndex.objectMetadataId === objectMetadataId)
      .map(
        (flatIndex) =>
          [...flatIndex.flatIndexFieldMetadatas].sort(
            (first, second) => first.order - second.order,
          )[0]?.fieldMetadataId,
      )
      .filter(isDefined),
  );

export const buildMissingSystemRelationIndexPlans = ({
  flatFieldMetadataMaps,
  flatIndexMaps,
  holderFlatObjectMetadataByNameSingular,
  twentyStandardApplicationUniversalIdentifier,
  now,
}: BuildMissingSystemRelationIndexPlansArgs): MissingSystemRelationIndexPlan[] =>
  Object.entries(holderFlatObjectMetadataByNameSingular).flatMap(
    ([holderNameSingular, holderFlatObjectMetadata]) => {
      const targetMorphId =
        STANDARD_OBJECTS[holderNameSingular as SystemRelationHolderNameSingular]
          .morphIds.targetMorphId.morphId;

      const leadingIndexedFieldMetadataIds =
        collectLeadingIndexedFieldMetadataIds({
          flatIndexMaps,
          objectMetadataId: holderFlatObjectMetadata.id,
        });

      return getFlatFieldsFromFlatObjectMetadata(
        holderFlatObjectMetadata,
        flatFieldMetadataMaps,
      )
        .filter(
          (flatFieldMetadata): flatFieldMetadata is FlatFieldMetadata =>
            flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
            flatFieldMetadata.morphId === targetMorphId &&
            isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
            isManyToOneFlatFieldMetadata(flatFieldMetadata) &&
            flatFieldMetadata.applicationUniversalIdentifier !==
              twentyStandardApplicationUniversalIdentifier &&
            !leadingIndexedFieldMetadataIds.has(flatFieldMetadata.id),
        )
        .map((flatFieldMetadata) => {
          const universalFlatIndexFieldMetadata = {
            createdAt: now,
            updatedAt: now,
            fieldMetadataUniversalIdentifier:
              flatFieldMetadata.universalIdentifier,
            order: 0,
            subFieldName: null,
          };

          const namedFlatIndexMetadata =
            generateFlatIndexMetadataWithNameOrThrow({
              flatObjectMetadata: holderFlatObjectMetadata,
              objectFlatFieldMetadatas: [flatFieldMetadata],
              flatIndex: {
                createdAt: now,
                updatedAt: now,
                universalIdentifier: '',
                applicationUniversalIdentifier:
                  flatFieldMetadata.applicationUniversalIdentifier,
                objectMetadataUniversalIdentifier:
                  holderFlatObjectMetadata.universalIdentifier,
                indexType: IndexType.BTREE,
                indexWhereClause: null,
                isCustom: true,
                isUnique: false,
                isSystemSideEffect: true,
                universalFlatIndexFieldMetadatas: [
                  {
                    ...universalFlatIndexFieldMetadata,
                    indexMetadataUniversalIdentifier: '',
                  },
                ],
              },
            });

          // The on-create handler mints a random identifier; a deterministic
          // one keeps reruns from planning the same index twice.
          const indexUniversalIdentifier = getIndexUniversalIdentifier({
            applicationUniversalIdentifier:
              flatFieldMetadata.applicationUniversalIdentifier,
            objectUniversalIdentifier:
              holderFlatObjectMetadata.universalIdentifier,
            name: namedFlatIndexMetadata.name,
          });

          return {
            holderFlatObjectMetadata,
            joinColumnName: computeMorphOrRelationFieldJoinColumnName({
              name: flatFieldMetadata.name,
            }),
            universalFlatIndexMetadata: {
              ...namedFlatIndexMetadata,
              universalIdentifier: indexUniversalIdentifier,
              universalFlatIndexFieldMetadatas: [
                {
                  ...universalFlatIndexFieldMetadata,
                  indexMetadataUniversalIdentifier: indexUniversalIdentifier,
                },
              ],
            },
          };
        })
        .filter(
          ({ universalFlatIndexMetadata }) =>
            !isDefined(
              flatIndexMaps.byUniversalIdentifier[
                universalFlatIndexMetadata.universalIdentifier
              ],
            ),
        );
    },
  );
