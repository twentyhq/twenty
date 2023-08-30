import { gql } from '@apollo/client';

export const CREATE_VIEW = gql`
  mutation CreateView($data: ViewCreateInput!) {
    view: createOneView(data: $data) {
      id
      name
    }
  }
`;
