const CAMPAIGN_SCHEDULE_LEAD_TIME_MS = 60 * 60 * 1000;
const HALF_HOUR_MS = 30 * 60 * 1000;

export const buildDefaultCampaignScheduledAt = () => {
  const earliestSendTime = Date.now() + CAMPAIGN_SCHEDULE_LEAD_TIME_MS;
  const nextHalfHour =
    Math.ceil(earliestSendTime / HALF_HOUR_MS) * HALF_HOUR_MS;

  return new Date(nextHalfHour);
};
