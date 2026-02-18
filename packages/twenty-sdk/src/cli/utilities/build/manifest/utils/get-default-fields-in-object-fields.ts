import type { ObjectConfig } from '@/sdk/objects/object-config';
import { getDefaultObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-object-fields';
import { getDefaultRelationObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-relation-object-fields';
import {
  type FieldManifest,
  type ObjectFieldManifest,
} from 'twenty-shared/application';

export const getDefaultFieldsInObjectFields = (
  objectConfig: ObjectConfig,
): { objectFields: ObjectFieldManifest[]; fields: FieldManifest[] } => {
  const defaultObjectFields = getDefaultObjectFields(objectConfig);
  const { objectFields: defaultRelationObjectFields, fields: reverseFields } =
    getDefaultRelationObjectFields(objectConfig);

  const objectConfigFieldNames = (objectConfig.fields ?? []).map((f) => f.name);

  const objectFieldsWithDefaults = [...objectConfig.fields];

  for (const defaultField of defaultObjectFields) {
    if (!objectConfigFieldNames.includes(defaultField.name)) {
      objectFieldsWithDefaults.push(defaultField);
    }
  }

  for (const defaultRelationField of defaultRelationObjectFields) {
    if (!objectConfigFieldNames.includes(defaultRelationField.name)) {
      objectFieldsWithDefaults.push(defaultRelationField);
    }
  }

  return { objectFields: objectFieldsWithDefaults, fields: reverseFields };
};
