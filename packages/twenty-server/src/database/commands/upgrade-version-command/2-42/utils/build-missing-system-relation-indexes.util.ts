import {
  type DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { generateIndexForFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-index-for-flat-field-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isManyToOneFlatFieldMetadata } from 'src/engine/twenty-orm/utils/is-many-to-one-flat-field-metadata.util';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export type SystemRelationHolderNameSingular =
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number];

export type MissingSystemRelationIndex = {
  holderFlatObjectMetadata: FlatObjectMetadata;
  joinColumnName: string;
  universalFlatIndexMetadata: UniversalFlatIndexMetadata;
};

type BuildMissingSystemRelationIndexesArgs = Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatIndexMaps'
> & {
  holderFlatObjectMetadataByNameSingular: Record<
    SystemRelationHolderNameSingular,
    FlatObjectMetadata
  >;
  twentyStandardApplicationUniversalIdentifier: string;
};

const collectLeadingIndexedFieldMetadataIds = ({
  flatIndexMaps,
  objectMetadataId,
}: Pick<BuildMissingSystemRelationIndexesArgs, 'flatIndexMaps'> & {
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

export const buildMissingSystemRelationIndexes = ({
  flatFieldMetadataMaps,
  flatIndexMaps,
  holderFlatObjectMetadataByNameSingular,
  twentyStandardApplicationUniversalIdentifier,
}: BuildMissingSystemRelationIndexesArgs): MissingSystemRelationIndex[] =>
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
        .map((flatFieldMetadata) => ({
          holderFlatObjectMetadata,
          joinColumnName: computeMorphOrRelationFieldJoinColumnName({
            name: flatFieldMetadata.name,
          }),
          universalFlatIndexMetadata: generateIndexForFlatFieldMetadata({
            flatFieldMetadata,
            flatObjectMetadata: holderFlatObjectMetadata,
          }),
        }));
    },
  );
