import { gql } from '@apollo/client';

export const VERIFY_OUTBOUND_MESSAGE_DOMAIN = gql`
  mutation VerifyOutboundMessageDomain($id: String!) {
    verifyOutboundMessageDomain(id: $id) {
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
