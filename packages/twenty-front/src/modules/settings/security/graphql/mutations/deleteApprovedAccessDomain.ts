import { gql } from '@apollo/client';

export const DELETE_APPROVED_ACCESS_DOMAIN = gql`
  mutation DeleteApprovedAccessDomain(
    $input: DeleteApprovedAccessDomainInput!
  ) {
    deleteApprovedAccessDomain(input: $input)
  }
`;
