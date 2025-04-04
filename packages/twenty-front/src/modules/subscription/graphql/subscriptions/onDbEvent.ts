import { gql } from '@apollo/client';

export const ON_DB_EVENT = gql`
  subscription OnDbEvent($input: OnDbEventInput!) {
    onDbEvent(input: $input) {
      eventId
      emittedAt
      action
      objectNameSingular
      updatedFields
      record
    }
  }
`;
