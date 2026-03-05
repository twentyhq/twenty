import { gql } from '@apollo/client';

export const UPLOAD_AI_CHAT_FILE = gql`
  mutation uploadAIChatFile($file: Upload!) {
    uploadAIChatFile(file: $file) {
      id
      path
      size
      createdAt
      url
    }
  }
`;
