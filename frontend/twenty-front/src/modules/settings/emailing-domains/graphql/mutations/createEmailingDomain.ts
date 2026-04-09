import { gql } from '@apollo/client';

export const CREATE_EMAILING_DOMAIN = gql`
  mutation CreateEmailingDomain(
    $domain: String!
    $driver: EmailingDomainDriver!
  ) {
    createEmailingDomain(domain: $domain, driver: $driver) {
      id
      domain
      driver
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
