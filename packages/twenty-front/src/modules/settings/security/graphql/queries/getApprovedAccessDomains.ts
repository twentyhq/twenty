import { gql } from '@apollo/client';

export const GET_ALL_APPROVED_ACCESS_DOMAINS = gql`
  query GetApprovedAccessDomains {
    getApprovedAccessDomains {
      id
      createdAt
      domain
      isValidated
    }
  }
`;
