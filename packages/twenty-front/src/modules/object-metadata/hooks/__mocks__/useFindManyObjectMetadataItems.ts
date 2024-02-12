import { gql } from '@apollo/client';

export const query = gql`
  query ObjectMetadataItems(
    $objectFilter: objectFilter
    $fieldFilter: fieldFilter
  ) {
    objects(paging: { first: 1000 }, filter: $objectFilter) {
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
          isSystem
          createdAt
          updatedAt
          labelIdentifierFieldMetadataId
          imageIdentifierFieldMetadataId
          fields(paging: { first: 1000 }, filter: $fieldFilter) {
            edges {
              node {
                id
                type
                name
                label
                description
                icon
                isCustom
                isActive
                isSystem
                isNullable
                createdAt
                updatedAt
                fromRelationMetadata {
                  id
                  relationType
                  toObjectMetadata {
                    id
                    dataSourceId
                    nameSingular
                    namePlural
                    isSystem
                  }
                  toFieldMetadataId
                }
                toRelationMetadata {
                  id
                  relationType
                  fromObjectMetadata {
                    id
                    dataSourceId
                    nameSingular
                    namePlural
                    isSystem
                  }
                  fromFieldMetadataId
                }
                defaultValue
                options
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

export const variables = { objectFilter: undefined, fieldFilter: undefined };

export const responseData = {
  objects: { edges: [] },
};
