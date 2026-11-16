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
}): ReadonlySet<string> => {
  const incomingFieldOptions = Object.values(
    incomingFlatFieldMetadataOptionMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatFieldMetadataOption) =>
        flatFieldMetadataOption.fieldMetadataUniversalIdentifier ===
        fieldMetadataUniversalIdentifier,
    );
  const incomingValues = new Set(
    incomingFieldOptions.map(({ value }) => value),
  );

  return new Set(
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
      .map(({ universalIdentifier, value }) => {
        const incomingOption =
          incomingFlatFieldMetadataOptionMaps.byUniversalIdentifier[
            universalIdentifier
          ];

        if (isDefined(incomingOption)) {
          return incomingOption.value;
        }

        // A row whose value the app now declares under another id is replaced by an active one.
        return incomingValues.has(value) ? undefined : value;
      })
      .filter(isDefined),
  );
};
