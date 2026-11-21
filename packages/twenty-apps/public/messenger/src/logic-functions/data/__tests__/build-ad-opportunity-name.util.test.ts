import { describe, expect, it } from 'vitest';

import { buildAdOpportunityName } from 'src/logic-functions/data/build-ad-opportunity-name.util';

describe('buildAdOpportunityName', () => {
  it('joins the person and the ad title', () => {
    expect(
      buildAdOpportunityName({
        personName: { firstName: 'Ada', lastName: 'Lovelace' },
        adTitle: 'Black Friday deals',
      }),
    ).toBe('Ada Lovelace · Black Friday deals');
  });

  it('falls back to Messenger ad when the ad has no title', () => {
    expect(
      buildAdOpportunityName({
        personName: { firstName: 'Ada', lastName: null },
        adTitle: undefined,
      }),
    ).toBe('Ada · Messenger ad');
  });

  it('uses the ad title alone for a person without a name', () => {
    expect(
      buildAdOpportunityName({ personName: null, adTitle: 'Spring sale' }),
    ).toBe('Spring sale');
  });
});
