import gql from 'graphql-tag';

export const GET_MY_CONVERSATION_START_MESSAGE_CHANNELS = gql`
  query MyConversationStartMessageChannels {
    myMessageChannels {
      id
      handle
      displayName
      type
      isSyncEnabled
      canStartConversation
      connectedAccountId
    }
  }
`;
