import type { ObjectConfig } from '@/sdk/objects/object-config';
import { getDefaultObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-object-fields';
import { getDefaultRelationObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-relation-object-fields';
import {
  type FieldManifest,
  type ObjectFieldManifest,
} from 'twenty-shared/application';

export const injectDefaultFieldsInObjectFields = (
  objectConfig: ObjectConfig,
): { objectFields: ObjectFieldManifest[]; fields: FieldManifest[] } => {
  const defaultObjectFields = getDefaultObjectFields(objectConfig);
  const defaultRelationObjectFields =
    getDefaultRelationObjectFields(objectConfig);

  const objectConfigFieldNames = (objectConfig.fields ?? []).map((f) => f.name);

  const fieldsWithDefaultFields = [...objectConfig.fields];

  for (const defaultField of defaultObjectFields) {
    if (!objectConfigFieldNames.includes(defaultField.name)) {
      fieldsWithDefaultFields.push(defaultField);
    }
  }

  for (const defaultRelationField of defaultRelationObjectFields) {
    if (!objectConfigFieldNames.includes(defaultRelationField.name)) {
      fieldsWithDefaultFields.push(defaultRelationField);
    }
  }

  return { objectFields: fieldsWithDefaultFields, fields: [] };
};
