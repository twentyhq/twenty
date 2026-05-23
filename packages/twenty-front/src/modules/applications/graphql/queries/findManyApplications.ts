import { gql } from '@apollo/client';

export const FIND_MANY_APPLICATIONS = gql`
  query FindManyApplications {
    findManyApplications {
      id
      name
      description
      logo {
        fileId
        label
        extension
        url
      }
      version
      universalIdentifier
      applicationRegistrationId
      applicationRegistration {
        id
        latestAvailableVersion
        sourceType
      }
    }
  }
`;
