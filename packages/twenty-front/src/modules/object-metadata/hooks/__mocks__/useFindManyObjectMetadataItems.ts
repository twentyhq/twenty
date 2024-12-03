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
          isRemote
          isActive
          isSystem
          createdAt
          updatedAt
          labelIdentifierFieldMetadataId
          imageIdentifierFieldMetadataId
          shortcut
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

export const variables = { objectFilter: undefined, fieldFilter: undefined };

export const responseData = {
  objects: { edges: [] },
};
