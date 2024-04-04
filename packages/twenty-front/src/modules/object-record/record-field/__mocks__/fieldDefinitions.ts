import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import {
  FieldFullNameMetadata,
  FieldLinkMetadata,
  FieldRatingMetadata,
  FieldSelectMetadata,
  FieldTextMetadata,
} from '@/object-record/record-field/types/FieldMetadata';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import {
  mockedCompaniesMetadata,
  mockedCustomMetadata,
  mockedPeopleMetadata,
} from '~/testing/mock-data/metadata';

export const fieldMetadataId = 'fieldMetadataId';

export const mockedPersonObjectMetadataItem = {
  ...mockedPeopleMetadata.node,
  fields: mockedPeopleMetadata.node.fields.edges.map(({ node }) => node),
};

export const mockedCompanyObjectMetadataItem = {
  ...mockedCompaniesMetadata.node,
  fields: mockedCompaniesMetadata.node.fields.edges.map(({ node }) => node),
};

export const mockedCustomObjectMetadataItem = {
  ...mockedCustomMetadata.node,
  fields: mockedCustomMetadata.node.fields.edges.map(({ node }) => node),
};

export const textfieldDefinition: FieldDefinition<FieldTextMetadata> = {
  fieldMetadataId,
  label: 'User Name',
  iconName: 'User',
  type: FieldMetadataType.Text,
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
  type: FieldMetadataType.Select,
  metadata: {
    fieldName: 'accountOwner',
    options: [{ label: 'Elon Musk', color: 'blue', value: 'userId' }],
  },
};

export const fullNameFieldDefinition: FieldDefinition<FieldFullNameMetadata> = {
  fieldMetadataId,
  label: 'Display Name',
  iconName: 'profile',
  type: FieldMetadataType.FullName,
  metadata: {
    fieldName: 'displayName',
    placeHolder: 'Mr Miagi',
  },
};

export const linkFieldDefinition: FieldDefinition<FieldLinkMetadata> = {
  fieldMetadataId,
  label: 'LinkedIn URL',
  iconName: 'url',
  type: FieldMetadataType.Link,
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
  type: FieldMetadataType.Rating,
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
