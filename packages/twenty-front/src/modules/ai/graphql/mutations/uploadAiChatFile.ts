import { gql } from '@apollo/client';

export const UPLOAD_AI_CHAT_FILE = gql`
  mutation uploadAiChatFile($file: Upload!) {
    uploadAiChatFile(file: $file) {
      id
      path
      size
      createdAt
      url
    }
  }
`;
