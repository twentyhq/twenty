import { gql } from '@apollo/client';

export const DISMISS_EMAIL_GROUP_CHANNEL_FORWARDING = gql`
  mutation DismissEmailGroupChannelForwarding($id: UUID!) {
    dismissEmailGroupChannelForwarding(id: $id)
  }
`;
