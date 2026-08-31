import { type CampaignCounts } from 'src/engine/core-modules/emailing-domain/types/campaign-counts.type';
import { hasCampaignCountsChanged } from 'src/engine/core-modules/emailing-domain/utils/has-campaign-counts-changed.util';

const counts: CampaignCounts = {
  totalCount: 10,
  inProgressCount: 2,
  sentCount: 6,
  deliveredCount: 5,
  failedCount: 1,
  skippedCount: 1,
  bouncedCount: 1,
  complainedCount: 0,
};

const stored = {
  sentCount: 6,
  deliveredCount: 5,
  failedCount: 1,
  skippedCount: 1,
  bouncedCount: 1,
  complainedCount: 0,
};

describe('hasCampaignCountsChanged', () => {
  it('leaves a campaign alone when every count already matches', () => {
    expect(hasCampaignCountsChanged(stored, counts)).toBe(false);
  });

  it('ignores the counts a campaign does not store', () => {
    expect(
      hasCampaignCountsChanged(stored, {
        ...counts,
        totalCount: 999,
        inProgressCount: 999,
      }),
    ).toBe(false);
  });

  it.each([
    'sentCount',
    'deliveredCount',
    'failedCount',
    'skippedCount',
    'bouncedCount',
    'complainedCount',
  ] as const)('notices %s moving', (countName) => {
    expect(
      hasCampaignCountsChanged(stored, {
        ...counts,
        [countName]: counts[countName] + 1,
      }),
    ).toBe(true);
  });
});
