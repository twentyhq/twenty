import { gql } from '@apollo/client';

export const CREATE_VIEW_FIELDS = gql`
  mutation CreateViewFields($data: [ViewFieldCreateManyInput!]!) {
    createManyViewField(data: $data) {
      count
    }
  }
`;
