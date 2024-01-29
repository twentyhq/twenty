import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import {
  FieldFullNameMetadata,
  FieldLinkMetadata,
  FieldRatingMetadata,
  FieldSelectMetadata,
  FieldTextMetadata,
} from '@/object-record/record-field/types/FieldMetadata';
import {
  mockedCompaniesMetadata,
  mockedPeopleMetadata,
} from '~/testing/mock-data/metadata';

export const fieldMetadataId = 'fieldMetadataId';

const mockedPersonObjectMetadataItem = {
  ...mockedPeopleMetadata.node,
  fields: mockedPeopleMetadata.node.fields.edges.map(({ node }) => node),
};
const mockedCompanyObjectMetadataItem = {
  ...mockedCompaniesMetadata.node,
  fields: mockedCompaniesMetadata.node.fields.edges.map(({ node }) => node),
};

export const textfieldDefinition: FieldDefinition<FieldTextMetadata> = {
  fieldMetadataId,
  label: 'User Name',
  iconName: 'User',
  type: 'TEXT',
  metadata: { placeHolder: 'John Doe', fieldName: 'userName' },
};

const relationFieldMetadataItem = mockedPersonObjectMetadataItem.fields.find(
  ({ name }) => name === 'company',
);
export const relationFieldDefinition = formatFieldMetadataItemAsFieldDefinition(
  {
    field: relationFieldMetadataItem!,
    objectMetadataItem: mockedPersonObjectMetadataItem,
  },
);

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
export const phoneFieldDefinition = formatFieldMetadataItemAsFieldDefinition({
  field: phoneFieldMetadataItem!,
  objectMetadataItem: mockedPersonObjectMetadataItem,
});

export const ratingfieldDefinition: FieldDefinition<FieldRatingMetadata> = {
  fieldMetadataId,
  label: 'Rating',
  iconName: 'iconName',
  type: 'RATING',
  metadata: {
    fieldName: 'rating',
  },
};

const booleanFieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
  ({ name }) => name === 'idealCustomerProfile',
);
export const booleanFieldDefinition = formatFieldMetadataItemAsFieldDefinition({
  field: booleanFieldMetadataItem!,
  objectMetadataItem: mockedCompanyObjectMetadataItem,
});
