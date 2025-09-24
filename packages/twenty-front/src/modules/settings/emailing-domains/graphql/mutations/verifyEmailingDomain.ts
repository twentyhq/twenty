import { gql } from '@apollo/client';

export const VERIFY_EMAILING_DOMAIN = gql`
  mutation VerifyEmailingDomain($id: String!) {
    verifyEmailingDomain(id: $id) {
      id
      domain
      driver
      status
      verifiedAt
      createdAt
      updatedAt
    }
  }
`;
