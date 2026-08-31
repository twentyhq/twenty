import { type CampaignCounts } from 'src/engine/core-modules/emailing-domain/types/campaign-counts.type';

type StoredCampaignCounts = Omit<
  CampaignCounts,
  'totalCount' | 'inProgressCount'
>;

export const hasCampaignCountsChanged = (
  stored: StoredCampaignCounts,
  counts: CampaignCounts,
): boolean =>
  stored.sentCount !== counts.sentCount ||
  stored.deliveredCount !== counts.deliveredCount ||
  stored.failedCount !== counts.failedCount ||
  stored.skippedCount !== counts.skippedCount ||
  stored.bouncedCount !== counts.bouncedCount ||
  stored.complainedCount !== counts.complainedCount;
