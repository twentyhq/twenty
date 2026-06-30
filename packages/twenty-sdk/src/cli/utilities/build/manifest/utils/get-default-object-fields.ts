import type { ObjectConfig } from '@/sdk/define/objects/object-config';
import { FieldMetadataType } from 'twenty-shared/types';
import { generateDefaultFieldUniversalIdentifier } from '@/sdk/define/objects/generate-default-field-universal-identifier';
import { type ObjectFieldManifest } from 'twenty-shared/application';

export const getDefaultObjectFields = (
  objectConfig: ObjectConfig,
): ObjectFieldManifest[] => {
  const objectUniversalIdentifier = objectConfig.universalIdentifier;

  const idField: ObjectFieldManifest = {
    name: 'id',
    label: 'Id',
    description: 'Id',
    icon: 'Icon123',
    isNullable: false,
    defaultValue: 'uuid',
    type: FieldMetadataType.UUID as const,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectUniversalIdentifier,
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
    type: FieldMetadataType.TEXT as const,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectUniversalIdentifier,
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
    type: FieldMetadataType.DATE_TIME as const,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectUniversalIdentifier,
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
    type: FieldMetadataType.DATE_TIME as const,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectUniversalIdentifier,
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
    type: FieldMetadataType.DATE_TIME as const,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectUniversalIdentifier,
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
    type: FieldMetadataType.ACTOR as const,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectUniversalIdentifier,
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
    type: FieldMetadataType.ACTOR as const,
    universalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectUniversalIdentifier,
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
      objectUniversalIdentifier,
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
      objectUniversalIdentifier,
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
