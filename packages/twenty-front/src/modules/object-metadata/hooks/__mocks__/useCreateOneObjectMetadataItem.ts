import { gql } from '@apollo/client';

export const query = gql`
  mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
    createOneObject(input: $input) {
      id
      nameSingular
      namePlural
      labelSingular
      labelPlural
      description
      icon
      isCustom
      isActive
      isSearchable
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
      isLabelSyncedWithName
    }
  }
`;

export const findManyViewsQuery = gql`
  query FindManyViews(
    $filter: ViewFilterInput
    $orderBy: [ViewOrderByInput]
    $lastCursor: String
    $limit: Int
  ) {
    views(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          __typename
          id
          objectMetadataId
          type
          createdAt
          name
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const variables = {
  input: {
    object: {
      icon: 'IconPlus',
      labelPlural: 'View Filters',
      labelSingular: 'View Filter',
      nameSingular: 'viewFilter',
      namePlural: 'viewFilters',
    },
  },
};

export const responseData = {
  id: '',
  nameSingular: 'viewFilter',
  namePlural: 'viewFilters',
  labelSingular: 'View Filter',
  labelPlural: 'View Filters',
  description: '',
  icon: '',
  isCustom: false,
  isActive: true,
  isSearchable: false,
  createdAt: '',
  updatedAt: '',
  labelIdentifierFieldMetadataId: '20202020-72ba-4e11-a36d-e17b544541e1',
  imageIdentifierFieldMetadataId: '',
};
