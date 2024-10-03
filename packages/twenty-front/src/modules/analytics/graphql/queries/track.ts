import { gql } from '@apollo/client';

export const TRACK = gql`
  mutation Track($type: String!, $sessionId: String!, $data: JSON!) {
    track(type: $type, sessionId: $sessionId, data: $data) {
      success
    }
  }
`;
