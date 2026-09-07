import { gql } from '@apollo/client';

export const GET_EMAIL_GROUP_FORWARDING_SETUPS = gql`
  query EmailGroupForwardingSetups {
    emailGroupForwardingSetups {
      messageChannelId
      status
    }
  }
`;
