import { gql } from '@apollo/client';

export const CREATE_EVENT = gql`
  mutation Track($type: String!, $data: JSON!) {
    track(type: $type, data: $data) {
      success
    }
  }
`;
