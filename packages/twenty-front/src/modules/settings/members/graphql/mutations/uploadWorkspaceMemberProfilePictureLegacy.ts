import { gql } from '@apollo/client';

export const UPLOAD_WORKSPACE_MEMBER_PROFILE_PICTURE_LEGACY = gql`
  mutation UploadWorkspaceMemberProfilePictureLegacy($file: Upload!) {
    uploadWorkspaceMemberProfilePictureLegacy(file: $file) {
      path
      token
    }
  }
`;
