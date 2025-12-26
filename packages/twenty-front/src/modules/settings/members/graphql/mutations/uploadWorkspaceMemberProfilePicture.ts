import { gql } from '@apollo/client';

export const UPLOAD_WORKSPACE_MEMBER_PROFILE_PICTURE = gql`
  mutation UploadWorkspaceMemberProfilePicture($file: Upload!) {
    uploadWorkspaceMemberProfilePicture(file: $file) {
      path
      token
    }
  }
`;
