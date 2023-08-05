import { gql } from '@apollo/client';

export const CREATE_VIEW_FIELD = gql`
  mutation CreateViewField($data: ViewFieldCreateInput!) {
    createOneViewField(data: $data) {
      id
      fieldName
      isVisible
      sizeInPx
      index
    }
  }
`;

export const CREATE_VIEW_FIELDS = gql`
  mutation CreateViewFields($data: [ViewFieldCreateManyInput!]!) {
    createManyViewField(data: $data) {
      count
    }
  }
`;
