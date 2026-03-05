import { gql } from '@apollo/client';

export const FIND_ONE_APPLICATION_BY_UNIVERSAL_IDENTIFIER = gql`
  query FindOneApplicationByUniversalIdentifier($universalIdentifier: UUID!) {
    findOneApplication(universalIdentifier: $universalIdentifier) {
      id
    }
  }
`;
