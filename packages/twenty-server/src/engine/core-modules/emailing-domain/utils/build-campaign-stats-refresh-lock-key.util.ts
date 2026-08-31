export const buildCampaignStatsRefreshLockKey = ({
  workspaceId,
  campaignId,
}: {
  workspaceId: string;
  campaignId: string;
}): string => `campaign-stats-refresh:${workspaceId}:${campaignId}`;
