import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { computeCampaignCounts } from 'src/engine/core-modules/emailing-domain/utils/compute-campaign-counts.util';

describe('computeCampaignCounts', () => {
  it('keeps counting a delivered message as sent', () => {
    const counts = computeCampaignCounts({
      deliveries: [
        {
          state: CAMPAIGN_DELIVERY_STATE.SENT,
          deliveredAt: new Date(),
          bouncedAt: null,
          complainedAt: null,
        },
      ],
    });

    expect(counts.sentCount).toBe(1);
    expect(counts.deliveredCount).toBe(1);
  });

  it('counts a complaint against a delivered message without losing either', () => {
    const counts = computeCampaignCounts({
      deliveries: [
        {
          state: CAMPAIGN_DELIVERY_STATE.SENT,
          deliveredAt: new Date('2026-01-01T00:00:00Z'),
          bouncedAt: null,
          complainedAt: new Date('2026-01-02T00:00:00Z'),
        },
      ],
    });

    expect(counts.sentCount).toBe(1);
    expect(counts.deliveredCount).toBe(1);
    expect(counts.complainedCount).toBe(1);
  });

  it('does not count a message we never sent', () => {
    const counts = computeCampaignCounts({
      deliveries: [
        {
          state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
          deliveredAt: null,
          bouncedAt: null,
          complainedAt: null,
        },
        {
          state: CAMPAIGN_DELIVERY_STATE.FAILED,
          deliveredAt: null,
          bouncedAt: null,
          complainedAt: null,
        },
      ],
    });

    expect(counts.sentCount).toBe(0);
    expect(counts.skippedCount).toBe(1);
    expect(counts.failedCount).toBe(1);
  });

  it('counts a bounce for a message that was sent', () => {
    const counts = computeCampaignCounts({
      deliveries: [
        {
          state: CAMPAIGN_DELIVERY_STATE.SENT,
          deliveredAt: null,
          bouncedAt: new Date(),
          complainedAt: null,
        },
      ],
    });

    expect(counts.sentCount).toBe(1);
    expect(counts.bouncedCount).toBe(1);
    expect(counts.deliveredCount).toBe(0);
  });
});
