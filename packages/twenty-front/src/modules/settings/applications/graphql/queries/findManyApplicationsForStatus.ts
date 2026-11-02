import { gql } from '@apollo/client';

export const FIND_MANY_APPLICATIONS_FOR_STATUS = gql`
  query FindManyApplicationsForStatus {
    findManyApplications {
      id
      applicationVariables {
        id
        key
        label
        value
        isRequired
        isDeprecated
        scope
      }
    }
  }
`;
