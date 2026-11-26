import { isFormulaFieldMetadata, isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import {
  type FormulaSourceUniversalFlatFieldMetadata,
  type FormulaSourceUniversalFlatObjectMetadata,
} from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-universal-flat-entity-maps.util';
import { setFormulaFieldBindings } from 'src/engine/metadata-modules/formula-field/utils/set-formula-field-bindings.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// A manifest declares only the expression, so its bindings are derived against the fields present after the sync
export const setFormulaFieldBindingsThroughMutation = ({
  existingFlatFieldMetadataMaps,
  universalFlatFieldMetadataMapsToMutate,
}: {
  existingFlatFieldMetadataMaps: Pick<
    AllFlatEntityMaps['flatFieldMetadataMaps'],
    'byUniversalIdentifier'
  >;
  universalFlatFieldMetadataMapsToMutate: Pick<
    UniversalFlatEntityMaps<UniversalFlatFieldMetadata>,
    'byUniversalIdentifier'
  >;
}): void => {
  const formulaUniversalFlatFieldMetadatas = Object.values(
    universalFlatFieldMetadataMapsToMutate.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(isFormulaFieldMetadata);

  if (formulaUniversalFlatFieldMetadatas.length === 0) {
    return;
  }

  const fieldByUniversalIdentifier: Partial<
    Record<string, FormulaSourceUniversalFlatFieldMetadata>
  > = {
    ...existingFlatFieldMetadataMaps.byUniversalIdentifier,
    ...universalFlatFieldMetadataMapsToMutate.byUniversalIdentifier,
  };
  const objectByUniversalIdentifier: Partial<
    Record<string, FormulaSourceUniversalFlatObjectMetadata>
  > = {};

  for (const field of Object.values(fieldByUniversalIdentifier)) {
    if (!isDefined(field)) {
      continue;
    }

    const object = (objectByUniversalIdentifier[
      field.objectMetadataUniversalIdentifier
    ] ??= {
      universalIdentifier: field.objectMetadataUniversalIdentifier,
      fieldUniversalIdentifiers: [],
    });

    object.fieldUniversalIdentifiers.push(field.universalIdentifier);
  }

  for (const universalFlatFieldMetadata of formulaUniversalFlatFieldMetadatas) {
    universalFlatFieldMetadataMapsToMutate.byUniversalIdentifier[
      universalFlatFieldMetadata.universalIdentifier
    ] = setFormulaFieldBindings({
      universalFlatFieldMetadata,
      existingFormula:
        existingFlatFieldMetadataMaps.byUniversalIdentifier[
          universalFlatFieldMetadata.universalIdentifier
        ]?.formula,
      universalFlatObjectMetadataMaps: {
        byUniversalIdentifier: objectByUniversalIdentifier,
      },
      universalFlatFieldMetadataMaps: {
        byUniversalIdentifier: fieldByUniversalIdentifier,
      },
    });
  }
};
