import { gql } from '@apollo/client';

export const DELETE_OUTBOUND_MESSAGE_DOMAIN = gql`
  mutation DeleteOutboundMessageDomain($id: String!) {
    deleteOutboundMessageDomain(id: $id)
  }
`;
