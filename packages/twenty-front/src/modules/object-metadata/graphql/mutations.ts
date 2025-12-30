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
      isCustom
      isActive
      isSearchable
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
      isLabelSyncedWithName
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
      isCustom
      isActive
      isSearchable
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
      isLabelSyncedWithName
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
      isCustom
      isActive
      isSearchable
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
      isLabelSyncedWithName
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
