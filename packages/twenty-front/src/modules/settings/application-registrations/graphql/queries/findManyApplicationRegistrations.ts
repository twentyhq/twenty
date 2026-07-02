import { gql } from '@apollo/client';

// The list fragment is defined here rather than in the fragments folder
// because the admin-panel codegen globs that folder and must not pick it up.
// It excludes isConfigured, which triggers a per-row DataLoader resolution
// the developer tab list never renders.
export const APPLICATION_REGISTRATION_LIST_ITEM_FRAGMENT = gql`
  fragment ApplicationRegistrationListItem on ApplicationRegistration {
    id
    universalIdentifier
    name
    sourceType
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
