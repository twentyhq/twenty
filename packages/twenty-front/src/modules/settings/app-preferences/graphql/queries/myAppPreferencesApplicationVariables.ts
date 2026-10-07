import { gql } from '@apollo/client';

export const MY_APP_PREFERENCES_APPLICATION_VARIABLES = gql`
  query MyAppPreferencesApplicationVariables(
    $applicationUniversalIdentifier: UUID!
  ) {
    myAppPreferencesApplicationVariables(
      applicationUniversalIdentifier: $applicationUniversalIdentifier
    ) {
      key
      value
      label
      description
      type
      options
      isSecret
      isRequired
      isDeprecated
    }
  }
`;
