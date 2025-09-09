import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export const filterMorphRelationDuplicateFields = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatFieldMetadata[] => {
  const initialAccumulator: {
    morphFlatFieldMetadatas: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[];
    otherFlatFieldMetadatas: FlatFieldMetadata[];
  } = {
    morphFlatFieldMetadatas: [],
    otherFlatFieldMetadatas: [],
  };
  const { morphFlatFieldMetadatas, otherFlatFieldMetadatas } =
    flatFieldMetadatas.reduce((acc, flatFieldMetadata) => {
      if (
        isFlatFieldMetadataOfType(
          flatFieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        )
      ) {
        return {
          ...acc,
          morphFlatFieldMetadatas: [
            ...acc.morphFlatFieldMetadatas,
            flatFieldMetadata,
          ],
        };
      }

      return {
        ...acc,
        otherFlatFieldMetadatas: [
          ...acc.otherFlatFieldMetadatas,
          flatFieldMetadata,
        ],
      };
    }, initialAccumulator);

  const filteredMorphFlatFieldMetadatas = morphFlatFieldMetadatas.filter(
    (currentField) =>
      !morphFlatFieldMetadatas.some(
        (otherField) =>
          currentField.id !== otherField.id &&
          otherField.morphId === currentField.morphId &&
          otherField.id < currentField.id,
      ),
  );

  return [...otherFlatFieldMetadatas, ...filteredMorphFlatFieldMetadatas];
};
