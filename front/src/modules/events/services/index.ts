import { gql } from '@apollo/client';

export const CREATE_EVENT = gql`
  mutation CreateEvent($type: String!, $data: String!) {
    createEvent(type: $type, data: $data) {
      success
    }
  }
`;
