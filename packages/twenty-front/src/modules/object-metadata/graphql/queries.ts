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
          isRemote
          isActive
          isSystem
          createdAt
          updatedAt
          labelIdentifierFieldMetadataId
          imageIdentifierFieldMetadataId
          shortcut
          isLabelSyncedWithName
          indexMetadatas(paging: { first: 100 }) {
            edges {
              node {
                id
                createdAt
                updatedAt
                name
                indexWhereClause
                indexType
                isUnique
                indexFieldMetadatas(paging: { first: 100 }) {
                  edges {
                    node {
                      id
                      createdAt
                      updatedAt
                      order
                      fieldMetadataId
                    }
                  }
                }
              }
            }
          }
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
                isUnique
                createdAt
                updatedAt
                defaultValue
                options
                settings
                isLabelSyncedWithName
                relationDefinition {
                  relationId
                  direction
                  sourceObjectMetadata {
                    id
                    nameSingular
                    namePlural
                  }
                  sourceFieldMetadata {
                    id
                    name
                  }
                  targetObjectMetadata {
                    id
                    nameSingular
                    namePlural
                  }
                  targetFieldMetadata {
                    id
                    name
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
