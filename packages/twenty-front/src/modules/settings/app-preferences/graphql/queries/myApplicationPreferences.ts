import { APPLICATION_CONNECTION_PROVIDER_FRAGMENT } from '@/settings/applications/graphql/fragments/applicationConnectionProviderFragment';
import { gql } from '@apollo/client';

export const MY_APPLICATION_PREFERENCES = gql`
  ${APPLICATION_CONNECTION_PROVIDER_FRAGMENT}
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
        slug
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
      connectionProviders {
        ...ApplicationConnectionProviderFragment
      }
    }
  }
`;
