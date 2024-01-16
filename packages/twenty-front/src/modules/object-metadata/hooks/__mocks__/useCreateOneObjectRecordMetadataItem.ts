import { gql } from '@apollo/client';

export const query = gql`
  mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
    createOneObject(input: $input) {
      id
      dataSourceId
      nameSingular
      namePlural
      labelSingular
      labelPlural
      description
      icon
      isCustom
      isActive
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
    }
  }
`;

export const variables = {
  input: {
    object: {
      labelPlural: 'View Filters',
      labelSingular: 'View Filter',
      nameSingular: 'viewFilter',
      namePlural: 'viewFilters',
    },
  },
};

export const responseData = {
  id: '',
  dataSourceId: '',
  nameSingular: 'viewFilter',
  namePlural: 'viewFilters',
  labelSingular: 'View Filter',
  labelPlural: 'View Filters',
  description: '',
  icon: '',
  isCustom: false,
  isActive: true,
  createdAt: '',
  updatedAt: '',
  labelIdentifierFieldMetadataId: '',
  imageIdentifierFieldMetadataId: '',
};
