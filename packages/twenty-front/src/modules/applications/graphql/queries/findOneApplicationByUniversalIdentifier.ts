import { gql } from '@apollo/client';

// Lean selection on purpose: the only caller (SettingsAvailableApplicationDetails)
// uses this query to know whether the app is installed and at which version,
// while the rest of the page renders from the marketplace manifest.
export const FIND_ONE_APPLICATION_BY_UNIVERSAL_IDENTIFIER = gql`
  query FindOneApplicationByUniversalIdentifier($universalIdentifier: UUID!) {
    findOneApplication(universalIdentifier: $universalIdentifier) {
      id
      universalIdentifier
      name
      version
    }
  }
`;
