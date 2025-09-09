import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { transpileToDateIfNot } from 'src/utils/transpile-to-date-if-not.util';

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
          otherField.morphId === currentField.morphId &&
          transpileToDateIfNot(otherField.createdAt).getTime() >
            transpileToDateIfNot(currentField.createdAt).getTime(),
      ),
  );

  return [...otherFlatFieldMetadatas, ...filteredMorphFlatFieldMetadatas];
};
