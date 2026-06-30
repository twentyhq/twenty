import { FieldMetadataType } from 'twenty-shared/types';
import { pickMorphGroupSurvivorOrThrow } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export const filterMorphRelationDuplicateFields = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatFieldMetadata[] => {
  const otherFlatFieldMetadatas: FlatFieldMetadata[] = [];
  const morphGroupsByMorphId = new Map<
    string,
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[]
  >();

  for (const flatFieldMetadata of flatFieldMetadatas) {
    if (
      isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      )
    ) {
      const existing =
        morphGroupsByMorphId.get(flatFieldMetadata.morphId) ?? [];

      morphGroupsByMorphId.set(flatFieldMetadata.morphId, [
        ...existing,
        flatFieldMetadata,
      ]);
    } else {
      otherFlatFieldMetadatas.push(flatFieldMetadata);
    }
  }

  const filteredMorphFlatFieldMetadatas: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] =
    [];

  for (const group of morphGroupsByMorphId.values()) {
    filteredMorphFlatFieldMetadatas.push(pickMorphGroupSurvivorOrThrow(group));
  }

  return [...otherFlatFieldMetadatas, ...filteredMorphFlatFieldMetadatas];
};
