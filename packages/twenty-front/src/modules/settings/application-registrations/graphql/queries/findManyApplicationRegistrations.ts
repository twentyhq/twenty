import { gql } from '@apollo/client';

export const APPLICATION_REGISTRATION_LIST_ITEM_FRAGMENT = gql`
  fragment ApplicationRegistrationListItem on ApplicationRegistration {
    id
    universalIdentifier
    name
    sourceType
    logoUrl
  }
`;

export const FIND_MANY_APPLICATION_REGISTRATIONS = gql`
  query FindManyApplicationRegistrations {
    findManyApplicationRegistrations {
      ...ApplicationRegistrationListItem
    }
  }
  ${APPLICATION_REGISTRATION_LIST_ITEM_FRAGMENT}
`;
