import { gql } from '@apollo/client';

export const WORKSPACE_APPLICATION_CONNECTED_MEMBER_COUNTS = gql`
  query WorkspaceApplicationConnectedMemberCounts {
    workspaceApplicationConnectedMemberCounts {
      applicationId
      connectedMemberCount
    }
  }
`;
