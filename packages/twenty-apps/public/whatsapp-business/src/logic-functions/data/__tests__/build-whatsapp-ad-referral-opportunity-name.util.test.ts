import { describe, expect, it } from 'vitest';
import { buildWhatsAppAdReferralOpportunityName } from 'src/logic-functions/data/build-whatsapp-ad-referral-opportunity-name.util';

describe('buildWhatsAppAdReferralOpportunityName', () => {
  it('should name the opportunity after the person and the ad', () => {
    expect(
      buildWhatsAppAdReferralOpportunityName({
        person: { name: { firstName: 'Ada', lastName: null } },
        adHeadline: 'Winter sale',
      }),
    ).toBe('Ada · Winter sale');
  });

  it('should use the ad alone when the person has no name', () => {
    expect(buildWhatsAppAdReferralOpportunityName({ person: { name: null }, adHeadline: 'Winter sale' })).toBe(
      'Winter sale',
    );
  });
});
