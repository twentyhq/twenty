import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { pickMorphRelationRepresentative } from 'src/engine/metadata-modules/flat-field-metadata/utils/pick-morph-relation-representative.util';

export const filterMorphRelationDuplicateFields = ({
  flatFieldMetadatas,
  isMorphRelationHeadEnabled,
}: {
  flatFieldMetadatas: FlatFieldMetadata[];
  isMorphRelationHeadEnabled: boolean;
}): FlatFieldMetadata[] => {
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

  const filteredMorphFlatFieldMetadatas = [...morphGroupsByMorphId.values()]
    .map((morphFlatFieldMetadatas) =>
      pickMorphRelationRepresentative({
        morphFlatFieldMetadatas,
        isMorphRelationHeadEnabled,
      }),
    )
    .filter(isDefined);

  return [...otherFlatFieldMetadatas, ...filteredMorphFlatFieldMetadatas];
};
