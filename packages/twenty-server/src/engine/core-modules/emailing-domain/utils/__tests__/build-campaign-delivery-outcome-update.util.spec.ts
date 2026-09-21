import { CAMPAIGN_PROVIDER_OUTCOME } from 'src/engine/core-modules/emailing-domain/constants/campaign-provider-outcome.constant';
import { buildCampaignDeliveryOutcomeUpdate } from 'src/engine/core-modules/emailing-domain/utils/build-campaign-delivery-outcome-update.util';

const occurredAt = new Date('2026-01-01T00:00:00Z');

describe('buildCampaignDeliveryOutcomeUpdate', () => {
  it.each([
    [CAMPAIGN_PROVIDER_OUTCOME.DELIVERED, 'deliveredAt'],
    [CAMPAIGN_PROVIDER_OUTCOME.BOUNCED, 'bouncedAt'],
    [CAMPAIGN_PROVIDER_OUTCOME.COMPLAINED, 'complainedAt'],
    [CAMPAIGN_PROVIDER_OUTCOME.REJECTED, 'rejectedAt'],
    [CAMPAIGN_PROVIDER_OUTCOME.RENDERING_FAILED, 'renderingFailedAt'],
  ] as const)('stamps %s on its own column', (outcome, column) => {
    expect(buildCampaignDeliveryOutcomeUpdate({ outcome, occurredAt })).toEqual(
      {
        [column]: occurredAt,
      },
    );
  });

  it('leaves the row alone for a soft bounce, which the provider will retry itself', () => {
    expect(
      buildCampaignDeliveryOutcomeUpdate({
        outcome: CAMPAIGN_PROVIDER_OUTCOME.SOFT_BOUNCED,
        occurredAt,
      }),
    ).toEqual({});
  });

  it('never writes the state or reason the send pipeline owns', () => {
    const updates = Object.values(CAMPAIGN_PROVIDER_OUTCOME).map((outcome) =>
      buildCampaignDeliveryOutcomeUpdate({ outcome, occurredAt }),
    );

    for (const update of updates) {
      expect(update).not.toHaveProperty('state');
      expect(update).not.toHaveProperty('skipReason');
      expect(update).not.toHaveProperty('failureReason');
    }
  });
});
