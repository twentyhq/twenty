import { gql } from '@apollo/client';

export const getMessageHtmlPreviewBatch = gql`
  query GetMessageHtmlPreviewBatch($messageThreadIds: [UUID!]!) {
    getMessageHtmlPreviewBatch(messageThreadIds: $messageThreadIds) {
      previews {
        messageId
        html
      }
    }
  }
`;
