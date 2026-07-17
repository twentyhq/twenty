import type { ObjectConfig } from '@/sdk/define/objects/object-config';
import {
  getFieldUniversalIdentifier,
  type ObjectFieldManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

const getDefaultNameObjectField = ({
  objectConfig,
  applicationUniversalIdentifier,
}: {
  objectConfig: ObjectConfig;
  applicationUniversalIdentifier: string;
}): ObjectFieldManifest => ({
  name: 'name',
  label: 'Name',
  description: 'Name',
  icon: 'IconAbc',
  isNullable: true,
  defaultValue: null,
  type: FieldMetadataType.TEXT,
  universalIdentifier: getFieldUniversalIdentifier({
    applicationUniversalIdentifier,
    objectUniversalIdentifier: objectConfig.universalIdentifier,
    name: 'name',
  }),
});

export const getDefaultFieldsInObjectFields = ({
  objectConfig,
  applicationUniversalIdentifier,
}: {
  objectConfig: ObjectConfig;
  applicationUniversalIdentifier: string;
}): { objectFields: ObjectFieldManifest[] } => {
  const objectConfigFieldNames = (objectConfig.fields ?? []).map(
    (field) => field.name,
  );

  const objectFieldsWithDefaults = [...objectConfig.fields];

  const defaultNameObjectField = getDefaultNameObjectField({
    objectConfig,
    applicationUniversalIdentifier,
  });

  if (!objectConfigFieldNames.includes(defaultNameObjectField.name)) {
    objectFieldsWithDefaults.push(defaultNameObjectField);
  }

  return { objectFields: objectFieldsWithDefaults };
};
