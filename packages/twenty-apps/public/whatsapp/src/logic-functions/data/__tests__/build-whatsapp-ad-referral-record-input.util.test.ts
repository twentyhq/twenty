import { describe, expect, it } from 'vitest';
import { buildWhatsAppAdReferralRecordInput } from 'src/logic-functions/data/build-whatsapp-ad-referral-record-input.util';

const REFERRED_AT = new Date('2026-11-20T10:00:00.000Z');

describe('buildWhatsAppAdReferralRecordInput', () => {
  it('should keep the ad identifiers and click ID', () => {
    expect(
      buildWhatsAppAdReferralRecordInput({
        referral: {
          source_id: '120200000000',
          source_type: 'ad',
          source_url: 'https://fb.me/ad',
          headline: 'Winter sale',
          body: 'Up to 50% off',
          media_type: 'image',
          ctwa_clid: 'ARAkLkA8rmlFeiCktEJQ',
        },
        personId: 'person-id',
        referredAt: REFERRED_AT,
      }),
    ).toEqual({
      headline: 'Winter sale',
      sourceId: '120200000000',
      sourceType: 'ad',
      sourceUrl: 'https://fb.me/ad',
      body: 'Up to 50% off',
      mediaType: 'image',
      ctwaClid: 'ARAkLkA8rmlFeiCktEJQ',
      referredAt: '2026-11-20T10:00:00.000Z',
      personId: 'person-id',
    });
  });

  it('should fall back to the ad text when the headline is missing', () => {
    expect(
      buildWhatsAppAdReferralRecordInput({ referral: { body: 'Book a demo' }, personId: 'person-id', referredAt: REFERRED_AT })
        .headline,
    ).toBe('Book a demo');
  });
});
