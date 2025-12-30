import { gql } from '@apollo/client';

export const OBJECT_METADATA_FRAGMENT = gql`
  fragment ObjectMetadataFields on Object {
    id
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
    isUIReadOnly
    createdAt
    updatedAt
    labelIdentifierFieldMetadataId
    imageIdentifierFieldMetadataId
    applicationId
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
      isCustom
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
      isUIReadOnly
      isNullable
      isUnique
      createdAt
      updatedAt
      defaultValue
      options
      settings
      isLabelSyncedWithName
      applicationId
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
      morphRelations {
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
`;
