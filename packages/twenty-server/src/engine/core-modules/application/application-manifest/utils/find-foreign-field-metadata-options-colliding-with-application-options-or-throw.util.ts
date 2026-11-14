import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

// Workspace edits can re-key an app field's options into rows the sync doesn't see but collides with: the app takes those values over.
export const findForeignFieldMetadataOptionsCollidingWithApplicationOptionsOrThrow =
  ({
    existingFlatFieldMetadataOptionMaps,
    toFlatFieldMetadataOptionMaps,
    toFlatFieldMetadataMaps,
    applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    existingFlatFieldMetadataOptionMaps: Pick<
      FlatFieldMetadataOptionMaps,
      'byUniversalIdentifier'
    >;
    toFlatFieldMetadataOptionMaps: Pick<
      MetadataUniversalFlatEntityMaps<'fieldMetadataOption'>,
      'byUniversalIdentifier'
    >;
    toFlatFieldMetadataMaps: Pick<
      MetadataUniversalFlatEntityMaps<'fieldMetadata'>,
      'byUniversalIdentifier'
    >;
    applicationUniversalIdentifier: string;
    workspaceCustomApplicationUniversalIdentifier: string;
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

    const collidingOptions = Object.values(
      existingFlatFieldMetadataOptionMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((existingOption) => {
        const applicationOptionValues =
          applicationOptionValuesByFieldUniversalIdentifier.get(
            existingOption.fieldMetadataUniversalIdentifier,
          );

        return (
          existingOption.applicationUniversalIdentifier !==
            applicationUniversalIdentifier &&
          !isDefined(
            toFlatFieldMetadataOptionMaps.byUniversalIdentifier[
              existingOption.universalIdentifier
            ],
          ) &&
          isDefined(applicationOptionValues) &&
          applicationOptionValues.has(existingOption.value)
        );
      });

    const optionOfAnotherApplication = collidingOptions.find(
      (collidingOption) =>
        collidingOption.applicationUniversalIdentifier !==
        workspaceCustomApplicationUniversalIdentifier,
    );

    if (isDefined(optionOfAnotherApplication)) {
      const fieldName =
        toFlatFieldMetadataMaps.byUniversalIdentifier[
          optionOfAnotherApplication.fieldMetadataUniversalIdentifier
        ]?.name ?? optionOfAnotherApplication.fieldMetadataUniversalIdentifier;

      throw new ApplicationException(
        `Option value ${optionOfAnotherApplication.value} of field ${fieldName} is already used by an option of application ${optionOfAnotherApplication.applicationUniversalIdentifier}`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    return collidingOptions;
  };
