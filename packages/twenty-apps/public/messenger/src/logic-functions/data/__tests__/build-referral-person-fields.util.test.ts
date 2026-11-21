import { describe, expect, it } from 'vitest';

import { buildReferralPersonFields } from 'src/logic-functions/data/build-referral-person-fields.util';

const REFERRED_AT = new Date('2026-11-21T09:00:00Z');

describe('buildReferralPersonFields', () => {
  it('records a Click-to-Messenger ad', () => {
    expect(
      buildReferralPersonFields({
        referral: {
          source: 'ADS',
          type: 'OPEN_THREAD',
          ref: 'black-friday',
          ad_id: '6045246247433',
          ads_context_data: { ad_title: 'Black Friday deals' },
        },
        referredAt: REFERRED_AT,
      }),
    ).toEqual({
      messengerReferralSource: 'ADS',
      messengerReferralRef: 'black-friday',
      messengerAdId: '6045246247433',
      messengerAdTitle: 'Black Friday deals',
      messengerReferredAt: '2026-11-21T09:00:00.000Z',
    });
  });

  it('clears the ad fields for an m.me link', () => {
    expect(
      buildReferralPersonFields({
        referral: { source: 'SHORTLINK', type: 'OPEN_THREAD', ref: 'footer' },
        referredAt: REFERRED_AT,
      }),
    ).toMatchObject({
      messengerReferralSource: 'SHORTLINK',
      messengerReferralRef: 'footer',
      messengerAdId: null,
      messengerAdTitle: null,
    });
  });
});
