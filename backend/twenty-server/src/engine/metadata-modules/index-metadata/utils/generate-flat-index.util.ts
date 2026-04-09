import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export type GenerateFlatIndexArgs = {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  flatIndex: Omit<UniversalFlatIndexMetadata, 'name'>;
};
export const generateFlatIndexMetadataWithNameOrThrow = ({
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  flatIndex,
}: GenerateFlatIndexArgs): UniversalFlatIndexMetadata => {
  const orderedFlatFields = flatIndex.universalFlatIndexFieldMetadatas
    .sort((a, b) => a.order - b.order)
    .map((flatIndexField) => {
      const relatedFlatFieldMetadata = objectFlatFieldMetadatas.find(
        (flatFieldMetadata) =>
          flatFieldMetadata.universalIdentifier ===
          flatIndexField.fieldMetadataUniversalIdentifier,
      );

      if (!isDefined(relatedFlatFieldMetadata)) {
        throw new FlatEntityMapsException(
          'Could not find flat index field related field in cache',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      const name = isMorphOrRelationUniversalFlatFieldMetadata(
        relatedFlatFieldMetadata,
      )
        ? (relatedFlatFieldMetadata.universalSettings.joinColumnName ??
          relatedFlatFieldMetadata.name)
        : relatedFlatFieldMetadata.name;

      return {
        name,
        isUnique: relatedFlatFieldMetadata.isUnique,
      };
    });

  const isUnique = orderedFlatFields.some((flatField) => flatField.isUnique);
  const orderedIndexColumnNames = orderedFlatFields.map(
    (flatField) => flatField.name,
  );
  const name = generateDeterministicIndexNameV2({
    flatObjectMetadata,
    orderedIndexColumnNames,
    isUnique,
  });

  return {
    ...flatIndex,
    name,
    isUnique,
  };
};
