import { gql } from '@apollo/client';

export const CREATE_EVENT = gql`
  mutation CreateEvent($type: String!, $data: JSON!) {
    createEvent(type: $type, data: $data) {
      success
    }
  }
`;
