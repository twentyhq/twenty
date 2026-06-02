import { gql } from '@apollo/client';

export const FIND_MANY_APPLICATIONS_FOR_TOOL_TABLE = gql`
  query FindManyApplicationsForToolTable {
    findManyApplications {
      id
      name
      universalIdentifier
      logo
    }
  }
`;
