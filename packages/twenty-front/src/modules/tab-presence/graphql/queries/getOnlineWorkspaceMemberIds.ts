import { gql } from '@apollo/client';

export const GET_ONLINE_WORKSPACE_MEMBER_IDS = gql`
  query GetOnlineWorkspaceMemberIds {
    onlineWorkspaceMemberIds
  }
`;
