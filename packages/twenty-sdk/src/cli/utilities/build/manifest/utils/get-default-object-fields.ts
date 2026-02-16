import type { ObjectConfig } from '@/sdk/objects/object-config';
import { FieldMetadataType } from 'twenty-shared/types';
import { generateDefaultFieldUniversalIdentifier } from '@/cli/utilities/build/manifest/utils/generate-default-field-universal-identifier';
import { type ObjectFieldManifest } from 'twenty-shared/application';

export const getDefaultObjectFields = (
  objectConfig: ObjectConfig,
): ObjectFieldManifest[] => {
  const idField: ObjectFieldManifest = {
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

  const nameField: ObjectFieldManifest = {
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

  const createdAtField: ObjectFieldManifest = {
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

  const updatedAtField: ObjectFieldManifest = {
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

  const deletedAtField: ObjectFieldManifest = {
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

  const createdByField: ObjectFieldManifest = {
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

  const updatedByField: ObjectFieldManifest = {
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

  const positionField: ObjectFieldManifest = {
    name: 'position',
    label: 'Position',
    description: 'Position',
    icon: 'IconHierarchy2',
    isNullable: false,
    defaultValue: 0,
    type: FieldMetadataType.POSITION,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'position',
    }),
  };

  const searchVectorField: ObjectFieldManifest = {
    name: 'searchVector',
    label: 'Search vector',
    icon: 'IconSearch',
    description: 'Search vector',
    isNullable: true,
    defaultValue: null,
    type: FieldMetadataType.TS_VECTOR,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'searchVector',
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
    positionField,
    searchVectorField,
  ];
};
