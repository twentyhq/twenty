import { gql } from '@apollo/client';

export const SEND_EVENT_MESSAGE = gql`
  mutation SendEventMessage($sendEventMessageInput: SendEventMessageInput!) {
    sendEventMessage(sendEventMessageInput: $sendEventMessageInput)
  }
`;
