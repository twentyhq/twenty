import { gql } from '@apollo/client';
import { APPLICATION_FRAGMENT } from '@/applications/graphql/fragments/applicationFragment';

export const FIND_MANY_APPLICATIONS = gql`
  ${APPLICATION_FRAGMENT}
  query FindManyApplications {
    findManyApplications {
      ...ApplicationFields
    }
  }
`;
