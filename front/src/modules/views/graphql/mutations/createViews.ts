import { gql } from '@apollo/client';

export const CREATE_VIEWS = gql`
  mutation CreateViews($data: [ViewCreateManyInput!]!) {
    createManyView(data: $data) {
      count
    }
  }
`;
