import { gql } from '@apollo/client';

export const VALIDATE_APPROVED_ACCESS_DOMAIN = gql`
  mutation ValidateApprovedAccessDomain(
    $input: ValidateApprovedAccessDomainInput!
  ) {
    validateApprovedAccessDomain(input: $input) {
      id
      isValidated
      domain
      createdAt
    }
  }
`;
