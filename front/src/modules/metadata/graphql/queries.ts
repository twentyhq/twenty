import { gql } from '@apollo/client';

export const FIND_MANY_METADATA_OBJECTS = gql`
  query ObjectMetadataItems {
    objects(paging: { first: 1000 }) {
      edges {
        node {
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
          fields(paging: { first: 1000 }) {
            edges {
              node {
                id
                type
                name
                label
                description
                icon
                placeholder
                isCustom
                isActive
                isNullable
                createdAt
                updatedAt
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            totalCount
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
