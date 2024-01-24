import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import {
  FieldBooleanMetadata,
  FieldFullNameMetadata,
  FieldLinkMetadata,
  FieldRatingMetadata,
  FieldSelectMetadata,
  FieldTextMetadata,
} from '@/object-record/record-field/types/FieldMetadata';
import { mockedPeopleMetadata } from '~/testing/mock-data/metadata';

export const fieldMetadataId = 'fieldMetadataId';

const mockedPersonObjectMetadataItem = {
  ...mockedPeopleMetadata.node,
  fields: mockedPeopleMetadata.node.fields.edges.map(({ node }) => node),
};

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

const relationFieldMetadataItem = mockedPersonObjectMetadataItem.fields.find(
  ({ name }) => name === 'company',
);
export const relationFieldDefinition = relationFieldMetadataItem
  ? formatFieldMetadataItemAsFieldDefinition({
      field: relationFieldMetadataItem,
      objectMetadataItem: mockedPersonObjectMetadataItem,
    })
  : undefined;

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

const phoneFieldMetadataItem = mockedPersonObjectMetadataItem.fields.find(
  ({ name }) => name === 'phone',
);
export const phoneFieldDefinition = phoneFieldMetadataItem
  ? formatFieldMetadataItemAsFieldDefinition({
      field: phoneFieldMetadataItem,
      objectMetadataItem: mockedPersonObjectMetadataItem,
    })
  : undefined;

export const ratingfieldDefinition: FieldDefinition<FieldRatingMetadata> = {
  fieldMetadataId,
  label: 'Rating',
  iconName: 'iconName',
  type: 'RATING',
  metadata: {
    fieldName: 'rating',
  },
};
