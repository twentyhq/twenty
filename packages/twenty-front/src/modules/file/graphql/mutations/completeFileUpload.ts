import { gql } from '@apollo/client';

export const COMPLETE_FILE_UPLOAD = gql`
  mutation CompleteFileUpload($fileId: String!) {
    completeFileUpload(fileId: $fileId) {
      id
      path
      size
      createdAt
      url
    }
  }
`;
