import { gql } from '@apollo/client';

export const UPLOAD_PROFILE_PICTURE = gql`
  mutation UploadProfilePicture($file: Upload!) {
    uploadProfilePicture(file: $file)
  }
`;
