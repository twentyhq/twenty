import { gql } from '@apollo/client';

export const MY_APPLICATION_PREFERENCES = gql`
  query MyApplicationPreferences {
    myApplicationPreferences {
      applicationId
      settingsMenuItems {
        id
        universalIdentifier
        applicationId
        frontComponentId
        title
        icon
        position
        scope
      }
      variables {
        key
        value
        description
        label
        isSecret
        isDeprecated
        isRequired
        type
        options
      }
    }
  }
`;
