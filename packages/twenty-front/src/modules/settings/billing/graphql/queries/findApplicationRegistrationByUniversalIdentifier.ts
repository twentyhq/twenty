import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_BY_UNIVERSAL_IDENTIFIER = gql`
  query FindApplicationRegistrationByUniversalIdentifier(
    $universalIdentifier: String!
  ) {
    findApplicationRegistrationByUniversalIdentifier(
      universalIdentifier: $universalIdentifier
    ) {
      id
      name
      logoUrl
      billingPrices {
        universalIdentifier
        per
      }
    }
  }
`;
