import { gql } from '@apollo/client';

export const GET_ALL_OBJECTS = gql`
  query MetadataObjects {
    objects {
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
          fields {
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
