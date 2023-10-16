import { gql } from '@apollo/client';

export const CREATE_ONE_OBJECT = gql`
  mutation CreateOneObject($input: CreateOneObjectInput!) {
    createOneObject(input: $input) {
      id
    }
  }
`;

export const CREATE_ONE_FIELD = gql`
  mutation CreateOneField($input: CreateOneFieldInput!) {
    createOneField(input: $input) {
      id
      type
      nameSingular
      namePlural
      labelSingular
      labelPlural
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
