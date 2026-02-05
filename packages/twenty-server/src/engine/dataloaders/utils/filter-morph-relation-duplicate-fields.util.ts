import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

// Returns true if otherField should be preferred over currentField
// Priority: 1) isActive (active fields preferred), 2) smaller UUID as tiebreaker
const shouldPreferOtherField = (
  currentField: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
  otherField: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
): boolean => {
  // If one is active and the other isn't, prefer the active one
  if (otherField.isActive && !currentField.isActive) {
    return true;
  }

  if (currentField.isActive && !otherField.isActive) {
    return false;
  }

  // Both have the same isActive status, use ID as tiebreaker
  return otherField.id < currentField.id;
};

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
          shouldPreferOtherField(currentField, otherField),
      ),
  );

  return [...otherFlatFieldMetadatas, ...filteredMorphFlatFieldMetadatas];
};
