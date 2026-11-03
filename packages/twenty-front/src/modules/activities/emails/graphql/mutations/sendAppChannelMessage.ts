import gql from 'graphql-tag';

export const SEND_APP_CHANNEL_MESSAGE = gql`
  mutation SendAppChannelMessage($input: SendAppChannelMessageInput!) {
    sendAppChannelMessage(input: $input) {
      messageId
      messageThreadId
    }
  }
`;
