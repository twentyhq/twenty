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
          indexMetadataList {
            id
            createdAt
            updatedAt
            name
            indexWhereClause
            indexType
            isUnique
            indexFieldMetadataList {
              id
              fieldMetadataId
              createdAt
              updatedAt
              order
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
