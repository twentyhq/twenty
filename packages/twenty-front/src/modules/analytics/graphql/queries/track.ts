import { gql } from '@apollo/client';

export const TRACK = gql`
  mutation Track($action: String!, $payload: JSON!) {
    track(action: $action, payload: $payload) {
      success
    }
  }
`;
