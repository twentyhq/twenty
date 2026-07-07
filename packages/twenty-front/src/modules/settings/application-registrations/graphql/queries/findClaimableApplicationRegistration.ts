import { gql } from '@apollo/client';

export const FIND_CLAIMABLE_APPLICATION_REGISTRATION = gql`
  query FindClaimableApplicationRegistration(
    $sourcePackage: String
    $id: String
  ) {
    findClaimableApplicationRegistration(
      sourcePackage: $sourcePackage
      id: $id
    ) {
      id
      name
      sourcePackage
      logoUrl
      description
      author
      isOwned
    }
  }
`;
