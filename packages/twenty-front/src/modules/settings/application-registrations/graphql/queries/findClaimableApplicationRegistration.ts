import { gql } from '@apollo/client';

export const FIND_CLAIMABLE_APPLICATION_REGISTRATION = gql`
  query FindClaimableApplicationRegistration(
    $sourcePackage: String
    $universalIdentifier: String
  ) {
    findClaimableApplicationRegistration(
      sourcePackage: $sourcePackage
      universalIdentifier: $universalIdentifier
    ) {
      id
      universalIdentifier
      name
      sourcePackage
      logoUrl
      description
      author
      isOwned
    }
  }
`;
