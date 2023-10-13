import { gql } from '@apollo/client';

export const GET_ALL_OBJECTS = gql`
  query Objects {
    objects(paging: { first: 100 }) {
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
          fields(paging: { first: 100 }) {
            edges {
              node {
                id
                type
                nameSingular
                namePlural
                labelSingular
                labelPlural
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
