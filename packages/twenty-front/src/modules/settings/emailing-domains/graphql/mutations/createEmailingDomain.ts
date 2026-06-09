import { gql } from '@apollo/client';

export const CREATE_EMAILING_DOMAIN = gql`
  mutation CreateEmailingDomain($domain: String!) {
    createEmailingDomain(domain: $domain) {
      id
      domain
      status
      verifiedAt
      verificationRecords {
        type
        key
        value
        priority
      }
      createdAt
      updatedAt
    }
  }
`;
