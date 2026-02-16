import { gql } from '@apollo/client';

export const UPLOAD_AGENT_CHAT_FILE = gql`
  mutation UploadAgentChatFile($file: Upload!) {
    uploadAgentChatFile(file: $file) {
      id
      path
      size
      createdAt
      url
    }
  }
`;
