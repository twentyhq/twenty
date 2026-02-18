import type { ObjectConfig } from '@/sdk/objects/object-config';
import { getDefaultObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-object-fields';

export const injectDefaultFieldsInObjectFields = (
  objectConfig: ObjectConfig,
) => {
  const defaultObjectFields = getDefaultObjectFields(objectConfig);

  const objectConfigFieldNames = (objectConfig.fields ?? []).map((f) => f.name);

  const fieldsWithDefaultFields = [...objectConfig.fields];

  for (const defaultField of defaultObjectFields) {
    if (!objectConfigFieldNames.includes(defaultField.name)) {
      fieldsWithDefaultFields.push(defaultField);
    }
  }

  return fieldsWithDefaultFields;
};
