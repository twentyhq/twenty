import { gql } from '@apollo/client';

export const TRACK = gql`
  mutation Track($type: String!, $data: JSON!) {
    track(type: $type, data: $data) {
      success
    }
  }
`;
