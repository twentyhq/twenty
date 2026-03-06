import { gql } from '@apollo/client';

export const UPLOAD_APP_TARBALL = gql`
  mutation UploadAppTarball($file: Upload!, $universalIdentifier: String) {
    uploadAppTarball(file: $file, universalIdentifier: $universalIdentifier) {
      id
      universalIdentifier
      name
    }
  }
`;
