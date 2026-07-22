import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_MESSAGE_CAMPAIGN_DAILY_SEND_LIMIT = gql`
  mutation UpdateWorkspaceMessageCampaignDailySendLimit(
    $workspaceId: UUID!
    $dailySendLimit: Int
  ) {
    updateWorkspaceMessageCampaignDailySendLimit(
      workspaceId: $workspaceId
      dailySendLimit: $dailySendLimit
    )
  }
`;
