import { gql } from '@apollo/client';

export const OBJECT_METADATA_FRAGMENT = gql`
  fragment ObjectMetadataFields on Object {
    id
    universalIdentifier
    nameSingular
    namePlural
    labelSingular
    labelPlural
    color
    description
    icon
    isRemote
    isActive
    isSystem
    isUIEditable
    isUICreatable
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
        subFieldName
        createdAt
        updatedAt
        order
      }
    }
    fieldsList {
      id
      universalIdentifier
      type
      name
      label
      description
      icon
      isActive
      isSystem
      isUIEditable
      isNullable
      isUnique
      createdAt
      updatedAt
      defaultValue
      options
      settings
      isLabelSyncedWithName
      morphId
      applicationId
      relation {
        type
        sourceObjectMetadata {
          id
          nameSingular
          namePlural
          labelSingular
          labelPlural
        }
        targetObjectMetadata {
          id
          nameSingular
          namePlural
          labelSingular
          labelPlural
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
          labelSingular
          labelPlural
        }
        targetObjectMetadata {
          id
          nameSingular
          namePlural
          labelSingular
          labelPlural
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
