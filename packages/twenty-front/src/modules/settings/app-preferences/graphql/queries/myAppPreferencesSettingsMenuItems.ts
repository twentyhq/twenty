import { gql } from '@apollo/client';

export const MY_APP_PREFERENCES_SETTINGS_MENU_ITEMS = gql`
  query MyAppPreferencesSettingsMenuItems(
    $applicationUniversalIdentifier: UUID!
  ) {
    myAppPreferencesSettingsMenuItems(
      applicationUniversalIdentifier: $applicationUniversalIdentifier
    ) {
      id
      universalIdentifier
      title
      icon
      position
      frontComponentId
    }
  }
`;
