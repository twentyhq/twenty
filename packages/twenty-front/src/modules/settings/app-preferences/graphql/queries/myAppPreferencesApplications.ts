import { gql } from '@apollo/client';

export const MY_APP_PREFERENCES_APPLICATIONS = gql`
  query MyAppPreferencesApplications {
    myAppPreferencesApplications {
      id
      universalIdentifier
      name
      logoUrl
      hasConnectionProviders
    }
  }
`;
