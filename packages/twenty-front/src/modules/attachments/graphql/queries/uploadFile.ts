import { gql } from '@apollo/client';

export const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!, $fileFolder: FileFolder) {
    uploadFile(file: $file, fileFolder: $fileFolder){
    id
    url
  }
  }
`;

export const ADD_ATTACHMENT = gql`
  mutation AddAttachment($fileId: ID!, $fileName: String!, $fileUrl: String!) {
    addAttachment(fileId: $fileId, fileName: $fileName, fileUrl: $fileUrl) {
      id
      fileName
      fileUrl
    }
  }
`;