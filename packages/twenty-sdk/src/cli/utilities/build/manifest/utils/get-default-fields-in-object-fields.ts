import type { ObjectConfig } from '@/sdk/define/objects/object-config';
import { getDefaultObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-object-fields';
import {
  type FieldManifest,
  type ObjectFieldManifest,
} from 'twenty-shared/application';

export const getDefaultFieldsInObjectFields = (
  objectConfig: ObjectConfig,
): { objectFields: ObjectFieldManifest[]; fields: FieldManifest[] } => {
  const defaultObjectFields = getDefaultObjectFields(objectConfig);

  const objectConfigFieldNames = (objectConfig.fields ?? []).map((f) => f.name);

  const objectFieldsWithDefaults = [...objectConfig.fields];

  for (const defaultField of defaultObjectFields) {
    if (!objectConfigFieldNames.includes(defaultField.name)) {
      objectFieldsWithDefaults.push(defaultField);
    }
  }

  return { objectFields: objectFieldsWithDefaults, fields: [] };
};
