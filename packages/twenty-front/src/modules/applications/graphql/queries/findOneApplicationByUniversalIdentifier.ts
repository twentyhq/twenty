import { gql } from '@apollo/client';
import { APPLICATION_FRAGMENT } from '@/applications/graphql/fragments/applicationFragment';

export const FIND_ONE_APPLICATION_BY_UNIVERSAL_IDENTIFIER = gql`
  ${APPLICATION_FRAGMENT}
  query FindOneApplicationByUniversalIdentifier($universalIdentifier: UUID!) {
    findOneApplication(universalIdentifier: $universalIdentifier) {
      ...ApplicationFields
    }
  }
`;
