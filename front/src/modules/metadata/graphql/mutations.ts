import { gql } from '@apollo/client';

export const CREATE_ONE_METADATA_OBJECT = gql`
  mutation CreateOneMetadataObject($input: CreateOneObjectInput!) {
    createOneObject(input: $input) {
      id
    }
  }
`;

export const CREATE_ONE_METADATA_FIELD = gql`
  mutation CreateOneMetadataField($input: CreateOneFieldInput!) {
    createOneField(input: $input) {
      id
      type
      name
      label
      description
      icon
      placeholder
      isCustom
      isActive
      isNullable
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ONE_METADATA_FIELD = gql`
  mutation UpdateOneMetadataField(
    $idToUpdate: ID!
    $updatePayload: UpdateFieldInput!
  ) {
    updateOneField(input: { id: $idToUpdate, update: $updatePayload }) {
      id
    }
  }
`;

export const UPDATE_ONE_METADATA_OBJECT = gql`
  mutation UpdateOneMetadataObject(
    $idToUpdate: ID!
    $updatePayload: UpdateObjectInput!
  ) {
    updateOneObject(input: { id: $idToUpdate, update: $updatePayload }) {
      id
    }
  }
`;
