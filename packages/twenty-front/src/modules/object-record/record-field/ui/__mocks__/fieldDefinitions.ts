import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  FieldActorMetadata,
  FieldFullNameMetadata,
  FieldLinksMetadata,
  FieldMorphRelationMetadata,
  FieldRatingMetadata,
  FieldSelectMetadata,
  FieldTextMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

export const fieldMetadataId = 'fieldMetadataId';

export const textfieldDefinition: FieldDefinition<FieldTextMetadata> = {
  fieldMetadataId,
  label: 'User Name',
  iconName: 'User',
  defaultValue: '',
  type: FieldMetadataType.TEXT,
  metadata: { placeHolder: 'John Doe', fieldName: 'userName' },
};

const mockedPersonObjectMetadataItem = generatedMockObjectMetadataItems.find(
  ({ nameSingular }) => nameSingular === 'person',
);

if (!mockedPersonObjectMetadataItem) {
  throw new Error('Person object metadata item not found');
}

const relationFieldMetadataItem = mockedPersonObjectMetadataItem?.fields?.find(
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
  type: FieldMetadataType.SELECT,
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
  type: FieldMetadataType.FULL_NAME,
  defaultValue: { firstName: '', lastName: '' },
  metadata: {
    fieldName: 'displayName',
    placeHolder: 'Mr Miagi',
  },
};

const phonesFieldMetadataItem = mockedPersonObjectMetadataItem.fields?.find(
  ({ name }) => name === 'phones',
);
export const phonesFieldDefinition = formatFieldMetadataItemAsFieldDefinition({
  field: phonesFieldMetadataItem!,
  objectMetadataItem: mockedPersonObjectMetadataItem,
});

export const ratingFieldDefinition: FieldDefinition<FieldRatingMetadata> = {
  fieldMetadataId,
  label: 'Rating',
  iconName: 'iconName',
  type: FieldMetadataType.RATING,
  defaultValue: null,
  metadata: {
    fieldName: 'rating',
  },
};

const mockedCompanyObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
);

if (!mockedCompanyObjectMetadataItem) {
  throw new Error('Company object metadata item not found');
}

const booleanFieldMetadataItem = mockedCompanyObjectMetadataItem?.fields?.find(
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
  type: FieldMetadataType.ACTOR,
  defaultValue: { source: 'MANUAL', name: '' },
  metadata: {
    fieldName: 'actor',
    objectMetadataNameSingular: 'person',
  },
};

export const linksFieldDefinition: FieldDefinition<FieldLinksMetadata> = {
  fieldMetadataId,
  label: 'Links',
  iconName: 'IconLink',
  type: FieldMetadataType.LINKS,
  defaultValue: {
    primaryLinkUrl: null,
    primaryLinkLabel: null,
    secondaryLinks: [],
  },
  metadata: {
    fieldName: 'links',
    objectMetadataNameSingular: 'company',
    settings: null,
  },
};

export const morphRelationFieldDefinition: FieldDefinition<FieldMorphRelationMetadata> =
  {
    fieldMetadataId,
    label: 'Attachments',
    iconName: 'IconLink',
    type: FieldMetadataType.MORPH_RELATION,
    defaultValue: [],
    metadata: {
      fieldName: 'attachments',
      objectMetadataNameSingular: 'company',
      morphRelations: [],
      relationType: RelationType.ONE_TO_MANY,
      settings: null,
    },
  };
