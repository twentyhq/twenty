import { isDefined, isFieldMetadataOptionActive } from 'twenty-shared/utils';

import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

// Inactivity lives on the existing row, but an app can rename the option's value in the same sync.
export const findInactiveFieldMetadataOptionValues = ({
  fieldMetadataUniversalIdentifier,
  existingFlatFieldMetadataOptionMaps,
  incomingFlatFieldMetadataOptionMaps,
}: {
  fieldMetadataUniversalIdentifier: string | undefined;
  existingFlatFieldMetadataOptionMaps: Pick<
    FlatFieldMetadataOptionMaps,
    'byUniversalIdentifier'
  >;
  incomingFlatFieldMetadataOptionMaps: Pick<
    UniversalFlatEntityMaps<UniversalFlatFieldMetadataOption>,
    'byUniversalIdentifier'
  >;
}): ReadonlySet<string> =>
  new Set(
    Object.values(existingFlatFieldMetadataOptionMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatFieldMetadataOption) =>
          flatFieldMetadataOption.fieldMetadataUniversalIdentifier ===
          fieldMetadataUniversalIdentifier,
      )
      .filter(
        (flatFieldMetadataOption) =>
          !isFieldMetadataOptionActive(
            resolveEffectiveFlatEntity({
              metadataName: 'fieldMetadataOption',
              flatEntity: flatFieldMetadataOption,
            }),
          ),
      )
      .map(
        ({ universalIdentifier, value }) =>
          incomingFlatFieldMetadataOptionMaps.byUniversalIdentifier[
            universalIdentifier
          ]?.value ?? value,
      ),
  );
