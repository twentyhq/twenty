import { gql } from '@apollo/client';

export const getMessageHtmlPreview = gql`
  query GetMessageHtmlPreview($messageId: UUID!) {
    getMessageHtmlPreview(messageId: $messageId) {
      messageId
      html
    }
  }
`;
