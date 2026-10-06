import { gql } from '@apollo/client';

export const FIND_MANY_APPLICATIONS_WITH_SETTINGS_MENU_ITEMS = gql`
  query FindManyApplicationsWithSettingsMenuItems {
    findManyApplications {
      id
      name
      logoUrl
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
    }
  }
`;
