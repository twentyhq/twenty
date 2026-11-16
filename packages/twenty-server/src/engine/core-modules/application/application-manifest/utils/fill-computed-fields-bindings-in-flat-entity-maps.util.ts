import { isComputedField, isDefined } from 'twenty-shared/utils';

import { bindComputedFieldComputationByPosition } from 'src/engine/metadata-modules/computed-field/utils/bind-computed-field-computation-by-position.util';
import { fillComputedFieldsBindings } from 'src/engine/metadata-modules/computed-field/utils/fill-computed-fields-bindings.util';
import { isComputedFieldComputationOnlyRenamed } from 'src/engine/metadata-modules/computed-field/utils/is-computed-field-computation-only-renamed.util';
import { isFieldMetadataComputation } from 'src/engine/metadata-modules/computed-field/utils/is-field-metadata-computation.util';
import { renameComputedFieldComputationToCurrentFieldNames } from 'src/engine/metadata-modules/computed-field/utils/rename-computed-field-computation-to-current-field-names.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type ComputedFieldFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
>;

// The field-rename side effect rewrote the saved computation, so the manifest still holds the old names.
// A manifest computation that resolves is never replaced: only a field outside the app keeps a workspace rename.
const keepSavedComputationRenamedFromManifest = <
  TField extends UniversalFlatFieldMetadata,
>({
  flatFieldMetadata,
  existingAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
}: {
  flatFieldMetadata: TField;
  existingAllFlatEntityMaps: ComputedFieldFlatEntityMaps;
  toAllUniversalFlatEntityMaps: ComputedFieldFlatEntityMaps;
}): TField => {
  const existingFlatFieldMetadata =
    existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
      flatFieldMetadata.universalIdentifier
    ];

  const { computation } = flatFieldMetadata;

  if (
    !isFieldMetadataComputation(computation) ||
    isDefined(computation.bindings) ||
    !isDefined(existingFlatFieldMetadata) ||
    !isComputedField(existingFlatFieldMetadata)
  ) {
    return flatFieldMetadata;
  }

  const flatFieldMetadataMapsAfterSync = {
    byUniversalIdentifier: {
      ...existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
      ...toAllUniversalFlatEntityMaps.flatFieldMetadataMaps
        .byUniversalIdentifier,
    },
  };
  const savedComputation = renameComputedFieldComputationToCurrentFieldNames({
    computation: existingFlatFieldMetadata.computation,
    flatFieldMetadataMaps: flatFieldMetadataMapsAfterSync,
  });

  return isComputedFieldComputationOnlyRenamed({
    existingComputation: bindComputedFieldComputationByPosition({
      computation,
      boundComputation: savedComputation,
    }),
    computation: savedComputation,
    flatFieldMetadataMaps: flatFieldMetadataMapsAfterSync,
  })
    ? { ...flatFieldMetadata, computation: savedComputation }
    : flatFieldMetadata;
};

// A computed field of the manifest may read fields of the workspace as well as fields of the manifest
export const fillComputedFieldsBindingsInFlatEntityMaps = ({
  existingAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
}: {
  existingAllFlatEntityMaps: ComputedFieldFlatEntityMaps;
  toAllUniversalFlatEntityMaps: ComputedFieldFlatEntityMaps;
}): void => {
  const { flatFieldMetadataMaps } = toAllUniversalFlatEntityMaps;

  const fillBindings = (flatFieldMetadatas: FlatFieldMetadata[]) =>
    fillComputedFieldsBindings({
      flatFieldMetadatas,
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

  const manifestFlatFieldMetadatas = fillBindings(
    Object.values(flatFieldMetadataMaps.byUniversalIdentifier).filter(
      isDefined,
    ),
  );
  const flatFieldMetadatasWithSavedNames = manifestFlatFieldMetadatas.map(
    (flatFieldMetadata) =>
      keepSavedComputationRenamedFromManifest({
        flatFieldMetadata,
        existingAllFlatEntityMaps,
        toAllUniversalFlatEntityMaps,
      }),
  );
  const hasKeptSavedComputation = flatFieldMetadatasWithSavedNames.some(
    (flatFieldMetadata, index) =>
      flatFieldMetadata !== manifestFlatFieldMetadatas[index],
  );

  for (const flatFieldMetadata of hasKeptSavedComputation
    ? fillBindings(flatFieldMetadatasWithSavedNames)
    : manifestFlatFieldMetadatas) {
    flatFieldMetadataMaps.byUniversalIdentifier[
      flatFieldMetadata.universalIdentifier
    ] = flatFieldMetadata;
  }
};
