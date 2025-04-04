import { gql } from '@apollo/client';

export const ON_DB_EVENT = gql`
  subscription OnDbEvent($input: DbEventSubscriptionInput!) {
    onDbEvent(input: $input) {
      action
      objectNameSingular
      record
      updatedFields
    }
  }
`;
