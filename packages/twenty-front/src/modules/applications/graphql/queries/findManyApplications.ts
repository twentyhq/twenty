import { gql } from '@apollo/client';

export const FIND_MANY_APPLICATIONS = gql`
  query FindManyApplications {
    findManyApplications {
      id
      name
      description
      logoUrl
      version
      universalIdentifier
      state
      applicationRegistrationId
      applicationRegistration {
        id
        latestAvailableVersion
        sourceType
      }
    }
  }
`;
