import { isDefined } from 'twenty-shared/utils';

import { fillComputedFieldsBindings } from 'src/engine/metadata-modules/computed-field/utils/fill-computed-fields-bindings.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

type ComputedFieldFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
>;

// A computed field of the manifest may read fields of the workspace as well as fields of the manifest
export const fillComputedFieldsBindingsInFlatEntityMaps = ({
  existingAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
}: {
  existingAllFlatEntityMaps: ComputedFieldFlatEntityMaps;
  toAllUniversalFlatEntityMaps: ComputedFieldFlatEntityMaps;
}): void => {
  const { flatFieldMetadataMaps } = toAllUniversalFlatEntityMaps;

  const flatFieldMetadatasWithBindings = fillComputedFieldsBindings({
    flatFieldMetadatas: Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined),
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        ...existingAllFlatEntityMaps.flatObjectMetadataMaps
          .byUniversalIdentifier,
        ...toAllUniversalFlatEntityMaps.flatObjectMetadataMaps
          .byUniversalIdentifier,
      },
    },
    flatFieldMetadataMaps: existingAllFlatEntityMaps.flatFieldMetadataMaps,
  });

  for (const flatFieldMetadata of flatFieldMetadatasWithBindings) {
    flatFieldMetadataMaps.byUniversalIdentifier[
      flatFieldMetadata.universalIdentifier
    ] = flatFieldMetadata;
  }
};
