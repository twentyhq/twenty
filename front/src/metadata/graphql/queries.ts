import { gql } from '@apollo/client';

export const GET_ALL_OBJECTS = gql`
  query Objects {
    objects(paging: { first: 100 }) {
      edges {
        node {
          id
          displayName
          displayNameSingular
          displayNamePlural
          description
          icon
          isCustom
          isActive
          createdAt
          updatedAt
          fields(paging: { first: 100 }) {
            edges {
              node {
                id
                type
                displayName
                description
                icon
                placeholder
                isCustom
                isActive
                isNullable
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
