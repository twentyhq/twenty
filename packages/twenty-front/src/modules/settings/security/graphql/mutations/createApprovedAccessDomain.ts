import { gql } from '@apollo/client';

export const CREATE_APPROVED_ACCESS_DOMAIN = gql`
  mutation CreateApprovedAccessDomain(
    $input: CreateApprovedAccessDomainInput!
  ) {
    createApprovedAccessDomain(input: $input) {
      id
      domain
      isValidated
      createdAt
    }
  }
`;
