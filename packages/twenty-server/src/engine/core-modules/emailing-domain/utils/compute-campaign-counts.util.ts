import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { UNFINISHED_CAMPAIGN_DELIVERY_STATES } from 'src/engine/core-modules/emailing-domain/constants/unfinished-campaign-delivery-states.constant';
import { type CampaignCountGroup } from 'src/engine/core-modules/emailing-domain/types/campaign-count-group.type';
import { type CampaignCounts } from 'src/engine/core-modules/emailing-domain/types/campaign-counts.type';

const EMPTY_CAMPAIGN_COUNTS: CampaignCounts = {
  totalCount: 0,
  inProgressCount: 0,
  sentCount: 0,
  deliveredCount: 0,
  failedCount: 0,
  skippedCount: 0,
  bouncedCount: 0,
  complainedCount: 0,
};

const countFailedInGroup = (group: CampaignCountGroup): number =>
  group.state === CAMPAIGN_DELIVERY_STATE.FAILED
    ? Number(group.total)
    : Number(group.providerFailedCount);

export const computeCampaignCounts = ({
  groups,
}: {
  groups: CampaignCountGroup[];
}): CampaignCounts =>
  groups.reduce<CampaignCounts>((counts, group) => {
    const total = Number(group.total);
    const isInProgress = UNFINISHED_CAMPAIGN_DELIVERY_STATES.includes(
      group.state,
    );

    return {
      totalCount: counts.totalCount + total,
      inProgressCount: counts.inProgressCount + (isInProgress ? total : 0),
      sentCount:
        counts.sentCount +
        (group.state === CAMPAIGN_DELIVERY_STATE.SENT ? total : 0),
      skippedCount:
        counts.skippedCount +
        (group.state === CAMPAIGN_DELIVERY_STATE.SKIPPED ? total : 0),
      failedCount: counts.failedCount + countFailedInGroup(group),
      deliveredCount: counts.deliveredCount + Number(group.deliveredCount),
      bouncedCount: counts.bouncedCount + Number(group.bouncedCount),
      complainedCount: counts.complainedCount + Number(group.complainedCount),
    };
  }, EMPTY_CAMPAIGN_COUNTS);
