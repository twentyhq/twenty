import gql from 'graphql-tag';

export const START_APP_CHANNEL_CONVERSATION = gql`
  mutation StartAppChannelConversation(
    $input: StartAppChannelConversationInput!
  ) {
    startAppChannelConversation(input: $input) {
      messageId
      messageThreadId
    }
  }
`;
