import gql from 'graphql-tag';

export const SEND_MESSAGE_BROADCAST = gql`
  mutation SendMessageBroadcast($input: SendMessageBroadcastInput!) {
    sendMessageBroadcast(input: $input) {
      broadcastId
      sentCount
      failedCount
    }
  }
`;
