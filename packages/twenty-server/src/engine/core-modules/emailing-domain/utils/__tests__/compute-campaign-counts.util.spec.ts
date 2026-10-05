import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { type CampaignCountGroup } from 'src/engine/core-modules/emailing-domain/types/campaign-count-group.type';
import { computeCampaignCounts } from 'src/engine/core-modules/emailing-domain/utils/compute-campaign-counts.util';

const buildGroup = (
  overrides: Partial<CampaignCountGroup>,
): CampaignCountGroup => ({
  state: CAMPAIGN_DELIVERY_STATE.SENT,
  total: '0',
  deliveredCount: '0',
  bouncedCount: '0',
  complainedCount: '0',
  providerFailedCount: '0',
  ...overrides,
});

describe('computeCampaignCounts', () => {
  it('keeps counting a delivered message as sent', () => {
    const counts = computeCampaignCounts({
      groups: [buildGroup({ total: '1', deliveredCount: '1' })],
    });

    expect(counts.sentCount).toBe(1);
    expect(counts.deliveredCount).toBe(1);
  });

  it('counts a complaint against a delivered message without losing either', () => {
    const counts = computeCampaignCounts({
      groups: [
        buildGroup({ total: '1', deliveredCount: '1', complainedCount: '1' }),
      ],
    });

    expect(counts.sentCount).toBe(1);
    expect(counts.deliveredCount).toBe(1);
    expect(counts.complainedCount).toBe(1);
  });

  it('does not count a message we never sent', () => {
    const counts = computeCampaignCounts({
      groups: [
        buildGroup({ state: CAMPAIGN_DELIVERY_STATE.SKIPPED, total: '1' }),
        buildGroup({ state: CAMPAIGN_DELIVERY_STATE.FAILED, total: '1' }),
      ],
    });

    expect(counts.sentCount).toBe(0);
    expect(counts.skippedCount).toBe(1);
    expect(counts.failedCount).toBe(1);
  });

  it('counts a bounce for a message that was sent', () => {
    const counts = computeCampaignCounts({
      groups: [buildGroup({ total: '1', bouncedCount: '1' })],
    });

    expect(counts.sentCount).toBe(1);
    expect(counts.bouncedCount).toBe(1);
    expect(counts.deliveredCount).toBe(0);
  });

  it('treats everything still queued or sending as in progress', () => {
    const counts = computeCampaignCounts({
      groups: [
        buildGroup({ state: CAMPAIGN_DELIVERY_STATE.QUEUED, total: '7' }),
        buildGroup({ state: CAMPAIGN_DELIVERY_STATE.SENDING, total: '3' }),
      ],
    });

    expect(counts.inProgressCount).toBe(10);
    expect(counts.totalCount).toBe(10);
  });

  it('adds every group up into one total', () => {
    const counts = computeCampaignCounts({
      groups: [
        buildGroup({ state: CAMPAIGN_DELIVERY_STATE.SENT, total: '600' }),
        buildGroup({ state: CAMPAIGN_DELIVERY_STATE.SKIPPED, total: '3' }),
        buildGroup({ state: CAMPAIGN_DELIVERY_STATE.FAILED, total: '2' }),
      ],
    });

    expect(counts.totalCount).toBe(605);
    expect(counts.sentCount).toBe(600);
  });

  it('counts a rejected send as failed while still counting it as sent', () => {
    const counts = computeCampaignCounts({
      groups: [buildGroup({ total: '10', providerFailedCount: '2' })],
    });

    expect(counts.sentCount).toBe(10);
    expect(counts.failedCount).toBe(2);
  });

  it('counts a failed row once even when the provider also refused it', () => {
    const counts = computeCampaignCounts({
      groups: [
        buildGroup({
          state: CAMPAIGN_DELIVERY_STATE.FAILED,
          total: '3',
          providerFailedCount: '3',
        }),
      ],
    });

    expect(counts.failedCount).toBe(3);
  });

  it('reads an empty campaign as all zeroes', () => {
    expect(computeCampaignCounts({ groups: [] })).toEqual({
      totalCount: 0,
      inProgressCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      skippedCount: 0,
      bouncedCount: 0,
      complainedCount: 0,
    });
  });
});
