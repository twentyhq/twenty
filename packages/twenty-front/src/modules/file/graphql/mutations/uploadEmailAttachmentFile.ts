import { gql } from '@apollo/client';

export const UPLOAD_EMAIL_ATTACHMENT_FILE = gql`
  mutation UploadEmailAttachmentFile($file: Upload!) {
    uploadEmailAttachmentFile(file: $file) {
      id
      path
      size
      createdAt
      url
    }
  }
`;
