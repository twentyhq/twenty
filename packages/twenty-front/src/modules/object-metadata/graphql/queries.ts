import { gql } from '@apollo/client';

export const FIND_MANY_OBJECT_METADATA_ITEMS = gql`
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
          isRemote
          isActive
          isSystem
          createdAt
          updatedAt
          labelIdentifierFieldMetadataId
          imageIdentifierFieldMetadataId
          shortcut
          isLabelSyncedWithName
          isSearchable
          duplicateCriteria
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
          fieldsList {
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
            relation {
              type
              sourceObjectMetadata {
                id
                nameSingular
                namePlural
              }
              targetObjectMetadata {
                id
                nameSingular
                namePlural
              }
              sourceFieldMetadata {
                id
                name
              }
              targetFieldMetadata {
                id
                name
              }
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
