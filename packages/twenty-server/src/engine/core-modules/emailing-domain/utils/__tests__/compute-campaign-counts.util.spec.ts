import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { computeCampaignCounts } from 'src/engine/core-modules/emailing-domain/utils/compute-campaign-counts.util';

describe('computeCampaignCounts', () => {
  it('should return zeroed counts when the campaign has no messages', () => {
    expect(computeCampaignCounts({ deliveryStatusCounts: [] })).toEqual({
      attemptedCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      softBouncedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      bouncedCount: 0,
      complainedCount: 0,
    });
  });

  it('should exclude queued, skipped and failed messages from the attempted count', () => {
    const { attemptedCount } = computeCampaignCounts({
      deliveryStatusCounts: [
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED, count: 5 },
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED, count: 3 },
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED, count: 2 },
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT, count: 7 },
      ],
    });

    expect(attemptedCount).toBe(7);
  });

  it('should report skipped messages so a credit-exhausted campaign is not read as a clean send', () => {
    const { skippedCount, attemptedCount } = computeCampaignCounts({
      deliveryStatusCounts: [
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED, count: 8 },
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT, count: 2 },
      ],
    });

    expect(skippedCount).toBe(8);
    expect(attemptedCount).toBe(2);
  });

  it('should keep the attempted count stable when a sent message later bounces', () => {
    const afterSending = computeCampaignCounts({
      deliveryStatusCounts: [
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT, count: 10 },
      ],
    });

    const afterOutcomes = computeCampaignCounts({
      deliveryStatusCounts: [
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT, count: 2 },
        {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.DELIVERED,
          count: 5,
        },
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED, count: 1 },
        {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SOFT_BOUNCED,
          count: 1,
        },
        {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
          count: 1,
        },
      ],
    });

    expect(afterSending.attemptedCount).toBe(10);
    expect(afterOutcomes.attemptedCount).toBe(10);
    expect(afterOutcomes.sentCount).toBe(2);
    expect(afterOutcomes.deliveredCount).toBe(5);
    expect(afterOutcomes.softBouncedCount).toBe(1);
    expect(afterOutcomes.bouncedCount).toBe(1);
    expect(afterOutcomes.complainedCount).toBe(1);
  });

  it('should count rejected and rendering-failed messages as attempted', () => {
    const { attemptedCount, failedCount } = computeCampaignCounts({
      deliveryStatusCounts: [
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.REJECTED, count: 4 },
        {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.RENDERING_FAILED,
          count: 2,
        },
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED, count: 6 },
      ],
    });

    expect(attemptedCount).toBe(6);
    expect(failedCount).toBe(6);
  });

  it('should ignore rows carrying an unknown or missing delivery status', () => {
    const counts = computeCampaignCounts({
      deliveryStatusCounts: [
        { deliveryStatus: null, count: 9 },
        { deliveryStatus: 'SOMETHING_ELSE', count: 4 },
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT, count: 1 },
      ],
    });

    expect(counts.attemptedCount).toBe(1);
    expect(counts.sentCount).toBe(1);
  });
});
