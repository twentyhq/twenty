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
