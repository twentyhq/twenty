import { gql } from '@apollo/client';

export const COMPLETE_WORKSPACE_MEMBER_PROFILE_PICTURE_UPLOAD = gql`
  mutation CompleteWorkspaceMemberProfilePictureUpload($fileId: String!) {
    completeWorkspaceMemberProfilePictureUpload(fileId: $fileId) {
      id
      path
      size
      createdAt
      url
    }
  }
`;
