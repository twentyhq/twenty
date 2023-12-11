import { gql } from '@apollo/client';

export const FIND_MANY_OBJECT_METADATA_ITEMS = gql`
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
