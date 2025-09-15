import { gql } from '@apollo/client';

export const VERIFY_OUTBOUND_MESSAGE_DOMAIN = gql`
  mutation VerifyOutboundMessageDomain(
    $input: VerifyOutboundMessageDomainInput!
  ) {
    verifyOutboundMessageDomain(input: $input) {
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
