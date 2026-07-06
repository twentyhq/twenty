import { getDefaultRelationObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-relation-object-fields';
import type { ObjectConfig } from '@/sdk/define/objects/object-config';
import {
  type FieldManifest,
  getFieldUniversalIdentifier,
  type ObjectFieldManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

// The reserved system fields (id, createdAt, updatedAt, deletedAt, createdBy,
// updatedBy, position, searchVector), the searchVector GIN index and the
// searchFieldMetadata are synthesized server-side by the objectMetadata
// side-effect engine, so the SDK does not materialize them into the manifest.
// The name field and the default relations to the standard objects ARE
// caller-provided defaults: the SDK auto-completes them here so they live in the
// manifest (present in both the from and to states on redeploy) and remain
// authorable.
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
}): { objectFields: ObjectFieldManifest[]; fields: FieldManifest[] } => {
  const { objectFields: defaultRelationObjectFields, fields: reverseFields } =
    getDefaultRelationObjectFields({
      objectConfig,
      applicationUniversalIdentifier,
    });

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

  for (const defaultRelationField of defaultRelationObjectFields) {
    if (!objectConfigFieldNames.includes(defaultRelationField.name)) {
      objectFieldsWithDefaults.push(defaultRelationField);
    }
  }

  return { objectFields: objectFieldsWithDefaults, fields: reverseFields };
};
