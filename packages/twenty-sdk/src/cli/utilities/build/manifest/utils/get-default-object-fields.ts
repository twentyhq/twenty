import { type ObjectManifest } from 'twenty-shared/application';
import type { ObjectConfig } from '@/sdk/objects/object-config';
import { FieldMetadataType } from 'twenty-shared/types';
import { generateDefaultFieldUniversalIdentifier } from '@/cli/utilities/build/manifest/utils/generate-default-field-universal-identifier';

export const getDefaultObjectFields = (
  objectConfig: ObjectConfig,
): ObjectManifest['fields'] => {
  const idField = {
    name: 'id',
    label: 'Id',
    description: 'Id',
    icon: 'Icon123',
    isNullable: false,
    defaultValue: 'uuid',
    type: FieldMetadataType.UUID,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'id',
    }),
  };

  const nameField = {
    name: 'name',
    label: 'Name',
    description: 'Name',
    icon: 'IconAbc',
    isNullable: true,
    defaultValue: null,
    type: FieldMetadataType.TEXT,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'name',
    }),
  };

  const createdAtField = {
    name: 'createdAt',
    label: 'Creation date',
    description: 'Creation date',
    icon: 'IconCalendar',
    isNullable: false,
    defaultValue: 'now',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'createdAt',
    }),
  };

  const updatedAtField = {
    name: 'updatedAt',
    label: 'Last update',
    description: 'Last time the record was changed',
    icon: 'IconCalendarClock',
    isNullable: false,
    defaultValue: 'now',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'updatedAt',
    }),
  };

  const deletedAtField = {
    name: 'deletedAt',
    label: 'Deleted at',
    description: 'Deletion date',
    icon: 'IconCalendarClock',
    isNullable: true,
    defaultValue: null,
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'deletedAt',
    }),
  };

  const createdByField = {
    name: 'createdBy',
    label: 'Created by',
    description: 'The creator of the record',
    icon: 'IconCreativeCommonsSa',
    isNullable: false,
    defaultValue: { name: "''", source: "'MANUAL'" },
    type: FieldMetadataType.ACTOR,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'createdBy',
    }),
  };

  const updatedByField = {
    name: 'updatedBy',
    label: 'Updated by',
    description: 'The workspace member who last updated the record',
    icon: 'IconUserCircle',
    isNullable: false,
    defaultValue: { name: "''", source: "'MANUAL'" },
    type: FieldMetadataType.ACTOR,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'updatedBy',
    }),
  };

  return [
    idField,
    nameField,
    createdAtField,
    updatedAtField,
    deletedAtField,
    createdByField,
    updatedByField,
  ];
};
