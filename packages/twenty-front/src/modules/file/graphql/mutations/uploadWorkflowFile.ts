import { gql } from '@apollo/client';

export const UPLOAD_WORKFLOW_FILE = gql`
  mutation UploadWorkflowFile($file: Upload!) {
    uploadWorkflowFile(file: $file) {
      id
      path
      size
      createdAt
      url
    }
  }
`;
