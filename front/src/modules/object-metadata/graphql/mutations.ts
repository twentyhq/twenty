import { gql } from '@apollo/client';

export const CREATE_ONE_OBJECT_METADATA_ITEM = gql`
  mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
    createOneObject(input: $input) {
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
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
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
      isNullable
      createdAt
      updatedAt
      defaultValue
      options
    }
  }
`;

export const CREATE_ONE_RELATION_METADATA_ITEM = gql`
  mutation CreateOneRelationMetadata($input: CreateOneRelationInput!) {
    createOneRelation(input: $input) {
      id
      relationType
      fromObjectMetadataId
      toObjectMetadataId
      fromFieldMetadataId
      toFieldMetadataId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ONE_FIELD_METADATA_ITEM = gql`
  mutation UpdateOneFieldMetadataItem(
    $idToUpdate: ID!
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
      isNullable
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ONE_OBJECT_METADATA_ITEM = gql`
  mutation UpdateOneObjectMetadataItem(
    $idToUpdate: ID!
    $updatePayload: UpdateObjectInput!
  ) {
    updateOneObject(input: { id: $idToUpdate, update: $updatePayload }) {
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
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
    }
  }
`;

export const DELETE_ONE_OBJECT_METADATA_ITEM = gql`
  mutation DeleteOneObjectMetadataItem($idToDelete: ID!) {
    deleteOneObject(input: { id: $idToDelete }) {
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
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
    }
  }
`;

export const DELETE_ONE_FIELD_METADATA_ITEM = gql`
  mutation DeleteOneFieldMetadataItem($idToDelete: ID!) {
    deleteOneField(input: { id: $idToDelete }) {
      id
      type
      name
      label
      description
      icon
      isCustom
      isActive
      isNullable
      createdAt
      updatedAt
    }
  }
`;
