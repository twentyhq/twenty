import { type ObjectConfig } from '@/app/manifest/types/object-config.type';
import { addMissingFieldOptionIds } from '@/app/manifest/utils/add-missing-field-option-ids';
import { getDefaultFieldsInObjectFields } from '@/app/manifest/utils/get-default-fields-in-object-fields';
import { type ObjectManifest } from 'twenty-shared/application';

export const fromObjectConfigToObjectManifest = ({
  objectConfig,
  applicationUniversalIdentifier,
}: {
  objectConfig: ObjectConfig;
  applicationUniversalIdentifier: string;
}): { objectManifest: ObjectManifest | null; errors: string[] } => {
  const { objectFields: objectFieldsWithDefaults } =
    getDefaultFieldsInObjectFields({
      objectConfig,
      applicationUniversalIdentifier,
    });

  const labelIdentifierFieldMetadataUniversalIdentifier =
    objectConfig.labelIdentifierFieldMetadataUniversalIdentifier ??
    objectFieldsWithDefaults.find((field) => field.name === 'name')
      ?.universalIdentifier;

  if (!labelIdentifierFieldMetadataUniversalIdentifier) {
    return {
      objectManifest: null,
      errors: [
        `No label identifier field found for object ${objectConfig.nameSingular}. Please add a field with name "name" to your object.`,
      ],
    };
  }

  const objectManifest: ObjectManifest = {
    ...objectConfig,
    fields: objectFieldsWithDefaults.map(addMissingFieldOptionIds),
    labelIdentifierFieldMetadataUniversalIdentifier,
  };

  return { objectManifest, errors: [] };
};
