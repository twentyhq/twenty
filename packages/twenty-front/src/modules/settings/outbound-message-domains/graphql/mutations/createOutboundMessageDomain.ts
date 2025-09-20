import { gql } from '@apollo/client';

export const CREATE_OUTBOUND_MESSAGE_DOMAIN = gql`
  mutation CreateOutboundMessageDomain(
    $domain: String!
    $driver: OutboundMessageDomainDriver!
  ) {
    createOutboundMessageDomain(domain: $domain, driver: $driver) {
      id
      domain
      driver
      status
      verifiedAt
      verificationRecords {
        type
        name
        value
        priority
      }
      createdAt
      updatedAt
    }
  }
`;
