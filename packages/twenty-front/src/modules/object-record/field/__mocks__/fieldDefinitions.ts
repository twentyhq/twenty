import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import {
  FieldBooleanMetadata,
  FieldFullNameMetadata,
  FieldLinkMetadata,
  FieldPhoneMetadata,
  FieldRatingMetadata,
  FieldRelationMetadata,
  FieldSelectMetadata,
  FieldTextMetadata,
} from '@/object-record/field/types/FieldMetadata';

export const fieldMetadataId = 'fieldMetadataId';

export const textfieldDefinition: FieldDefinition<FieldTextMetadata> = {
  fieldMetadataId,
  label: 'User Name',
  iconName: 'User',
  type: 'TEXT',
  metadata: { placeHolder: 'John Doe', fieldName: 'userName' },
};

export const booleanFieldDefinition: FieldDefinition<FieldBooleanMetadata> = {
  fieldMetadataId,
  label: 'Is Active?',
  iconName: 'iconName',
  type: 'BOOLEAN',
  metadata: {
    objectMetadataNameSingular: 'person',
    fieldName: 'isActive',
  },
};

export const relationFieldDefinition: FieldDefinition<FieldRelationMetadata> = {
  fieldMetadataId,
  label: 'Contact',
  iconName: 'Phone',
  type: 'RELATION',
  metadata: {
    fieldName: 'contact',
    relationFieldMetadataId: 'relationFieldMetadataId',
    relationObjectMetadataNamePlural: 'users',
    relationObjectMetadataNameSingular: 'user',
  },
};

export const selectFieldDefinition: FieldDefinition<FieldSelectMetadata> = {
  fieldMetadataId,
  label: 'Account Owner',
  iconName: 'iconName',
  type: 'SELECT',
  metadata: {
    fieldName: 'accountOwner',
    options: [{ label: 'Elon Musk', color: 'blue', value: 'userId' }],
  },
};

export const fullNameFieldDefinition: FieldDefinition<FieldFullNameMetadata> = {
  fieldMetadataId,
  label: 'Display Name',
  iconName: 'profile',
  type: 'FULL_NAME',
  metadata: {
    fieldName: 'displayName',
    placeHolder: 'Mr Miagi',
  },
};

export const linkFieldDefinition: FieldDefinition<FieldLinkMetadata> = {
  fieldMetadataId,
  label: 'LinkedIn URL',
  iconName: 'url',
  type: 'LINK',
  metadata: {
    fieldName: 'linkedInURL',
    placeHolder: 'https://linkedin.com/user',
  },
};

export const phoneFieldDefinition: FieldDefinition<FieldPhoneMetadata> = {
  fieldMetadataId,
  label: 'Contact',
  iconName: 'Phone',
  type: 'TEXT',
  metadata: {
    objectMetadataNameSingular: 'person',
    placeHolder: '(+256)-712-345-6789',
    fieldName: 'phone',
  },
};

export const ratingfieldDefinition: FieldDefinition<FieldRatingMetadata> = {
  fieldMetadataId,
  label: 'Rating',
  iconName: 'iconName',
  type: 'RATING',
  metadata: {
    fieldName: 'rating',
  },
};
