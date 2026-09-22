import { gql } from '@apollo/client';

export const CREATE_WORKSPACE_MEMBER_PROFILE_PICTURE_UPLOAD = gql`
  mutation CreateWorkspaceMemberProfilePictureUpload(
    $filename: String!
    $size: Float!
  ) {
    createWorkspaceMemberProfilePictureUpload(
      filename: $filename
      size: $size
    ) {
      fileId
      uploadUrl
      contentType
      expiresAt
    }
  }
`;
