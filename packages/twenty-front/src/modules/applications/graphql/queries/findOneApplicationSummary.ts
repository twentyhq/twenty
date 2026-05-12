import { gql } from '@apollo/client';

export const FIND_ONE_APPLICATION_SUMMARY = gql`
  query FindOneApplicationSummary($universalIdentifier: UUID!) {
    findOneApplication(universalIdentifier: $universalIdentifier) {
      id
    }
  }
`;
