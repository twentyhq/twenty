import { gql } from '@apollo/client';

export const CREATE_ONE_OBJECT_METADATA_ITEM = gql`
  mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
    createOneObject(input: $input) {
      id
      nameSingular
      namePlural
      labelSingular
      labelPlural
      description
      icon
      color
      isCustom
      isActive
      isSearchable
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
      isLabelSyncedWithName
      applicationId
      fieldsList {
        id
        universalIdentifier
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
        morphId
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
  }
`;

export const CREATE_ONE_FIELD_METADATA_ITEM = gql`
  mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
    createOneField(input: $input) {
      id
      type
      name
      label
      description
      icon
      isCustom
      isActive
      isUnique
      isNullable
      createdAt
      updatedAt
      settings
      defaultValue
      options
      isLabelSyncedWithName
      applicationId
      object {
        id
      }
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

export const UPDATE_ONE_FIELD_METADATA_ITEM = gql`
  mutation UpdateOneFieldMetadataItem(
    $idToUpdate: UUID!
    $updatePayload: UpdateFieldInput!
  ) {
    updateOneField(input: { id: $idToUpdate, update: $updatePayload }) {
      id
      type
      name
      label
      description
      icon
      isCustom
      isActive
      isUnique
      isNullable
      createdAt
      updatedAt
      settings
      isLabelSyncedWithName
      applicationId
      object {
        id
      }
    }
  }
`;

export const UPDATE_ONE_OBJECT_METADATA_ITEM = gql`
  mutation UpdateOneObjectMetadataItem(
    $idToUpdate: UUID!
    $updatePayload: UpdateObjectPayload!
  ) {
    updateOneObject(input: { id: $idToUpdate, update: $updatePayload }) {
      id
      nameSingular
      namePlural
      labelSingular
      labelPlural
      description
      icon
      color
      isCustom
      isActive
      isSearchable
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
      isLabelSyncedWithName
      applicationId
    }
  }
`;

export const DELETE_ONE_OBJECT_METADATA_ITEM = gql`
  mutation DeleteOneObjectMetadataItem($idToDelete: UUID!) {
    deleteOneObject(input: { id: $idToDelete }) {
      id
      nameSingular
      namePlural
      labelSingular
      labelPlural
      description
      icon
      color
      isCustom
      isActive
      isSearchable
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
      isLabelSyncedWithName
      applicationId
    }
  }
`;

export const DELETE_ONE_FIELD_METADATA_ITEM = gql`
  mutation DeleteOneFieldMetadataItem($idToDelete: UUID!) {
    deleteOneField(input: { id: $idToDelete }) {
      id
      type
      name
      label
      description
      icon
      isCustom
      isActive
      isUnique
      isNullable
      createdAt
      updatedAt
      settings
      applicationId
      object {
        id
      }
    }
  }
`;
