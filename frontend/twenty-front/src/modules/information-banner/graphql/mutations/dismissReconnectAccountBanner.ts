import { gql } from '@apollo/client';

export const DISMISS_RECONNECT_ACCOUNT_BANNER = gql`
  mutation DismissReconnectAccountBanner($connectedAccountId: UUID!) {
    dismissReconnectAccountBanner(connectedAccountId: $connectedAccountId)
  }
`;
