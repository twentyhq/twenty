import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import {
  FieldActorMetadata,
  FieldFullNameMetadata,
  FieldLinkMetadata,
  FieldRatingMetadata,
  FieldSelectMetadata,
  FieldTextMetadata
} from '@/object-record/record-field/types/FieldMetadata';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import {
  mockedCompanyObjectMetadataItem,
  mockedPersonObjectMetadataItem,
} from '~/testing/mock-data/metadata';
export const fieldMetadataId = 'fieldMetadataId';

export const textfieldDefinition: FieldDefinition<FieldTextMetadata> = {
  fieldMetadataId,
  label: 'User Name',
  iconName: 'User',
  defaultValue: '',
  type: FieldMetadataType.Text,
  metadata: { placeHolder: 'John Doe', fieldName: 'userName' },
};

const relationFieldMetadataItem = mockedPersonObjectMetadataItem.fields?.find(
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
  defaultValue: null,
  metadata: {
    fieldName: 'accountOwner',
    options: [{ label: 'Elon Musk', color: 'blue', value: 'userId' }],
    isNullable: true,
  },
};

export const fullNameFieldDefinition: FieldDefinition<FieldFullNameMetadata> = {
  fieldMetadataId,
  label: 'Display Name',
  iconName: 'profile',
  type: FieldMetadataType.FullName,
  defaultValue: { firstName: '', lastName: '' },
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
  defaultValue: { url: '', label: '' },
  metadata: {
    fieldName: 'linkedInURL',
    placeHolder: 'https://linkedin.com/user',
  },
};

const phoneFieldMetadataItem = mockedPersonObjectMetadataItem.fields?.find(
  ({ name }) => name === 'phone',
);
export const phoneFieldDefinition = formatFieldMetadataItemAsFieldDefinition({
  field: phoneFieldMetadataItem!,
  objectMetadataItem: mockedPersonObjectMetadataItem,
});

export const ratingFieldDefinition: FieldDefinition<FieldRatingMetadata> = {
  fieldMetadataId,
  label: 'Rating',
  iconName: 'iconName',
  type: FieldMetadataType.Rating,
  defaultValue: null,
  metadata: {
    fieldName: 'rating',
  },
};

const booleanFieldMetadataItem = mockedCompanyObjectMetadataItem.fields?.find(
  ({ name }) => name === 'idealCustomerProfile',
);
export const booleanFieldDefinition = formatFieldMetadataItemAsFieldDefinition({
  field: booleanFieldMetadataItem!,
  objectMetadataItem: mockedCompanyObjectMetadataItem,
});

export const actorFieldDefinition: FieldDefinition<FieldActorMetadata> = {
  fieldMetadataId,
  label: 'Created By',
  iconName: 'restart',
  type: FieldMetadataType.Actor,
  defaultValue: { source: 'MANUAL', name: '' },
  metadata: {
    fieldName: 'actor',
  },
};