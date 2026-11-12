import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

// A workspace edit that changes an app field's option ids replaces the app's rows with
// caller-owned ones. The sync never sees them, so they would block its rows on value.
export const findForeignFieldMetadataOptionsCollidingWithApplicationOptions = ({
  existingFlatFieldMetadataOptionMaps,
  toFlatFieldMetadataOptionMaps,
  applicationUniversalIdentifier,
}: {
  existingFlatFieldMetadataOptionMaps: Pick<
    FlatFieldMetadataOptionMaps,
    'byUniversalIdentifier'
  >;
  toFlatFieldMetadataOptionMaps: Pick<
    MetadataUniversalFlatEntityMaps<'fieldMetadataOption'>,
    'byUniversalIdentifier'
  >;
  applicationUniversalIdentifier: string;
}): FlatFieldMetadataOption[] => {
  const applicationOptionValuesByFieldUniversalIdentifier = new Map<
    string,
    Set<string>
  >();

  for (const applicationOption of Object.values(
    toFlatFieldMetadataOptionMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(applicationOption)) {
      continue;
    }

    const fieldOptionValues =
      applicationOptionValuesByFieldUniversalIdentifier.get(
        applicationOption.fieldMetadataUniversalIdentifier,
      ) ?? new Set<string>();

    fieldOptionValues.add(applicationOption.value);
    applicationOptionValuesByFieldUniversalIdentifier.set(
      applicationOption.fieldMetadataUniversalIdentifier,
      fieldOptionValues,
    );
  }

  return Object.values(existingFlatFieldMetadataOptionMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (existingOption) =>
        existingOption.applicationUniversalIdentifier !==
          applicationUniversalIdentifier &&
        !isDefined(
          toFlatFieldMetadataOptionMaps.byUniversalIdentifier[
            existingOption.universalIdentifier
          ],
        ) &&
        applicationOptionValuesByFieldUniversalIdentifier
          .get(existingOption.fieldMetadataUniversalIdentifier)
          ?.has(existingOption.value) === true,
    );
};
