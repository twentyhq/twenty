import { gql } from '@apollo/client';

export const CREATE_OUTBOUND_MESSAGE_DOMAIN = gql`
  mutation CreateOutboundMessageDomain(
    $input: CreateOutboundMessageDomainInput!
  ) {
    createOutboundMessageDomain(input: $input) {
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
