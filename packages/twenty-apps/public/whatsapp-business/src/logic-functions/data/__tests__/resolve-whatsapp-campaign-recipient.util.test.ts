import { describe, expect, it } from 'vitest';
import { resolveWhatsAppCampaignRecipient } from 'src/logic-functions/data/resolve-whatsapp-campaign-recipient.util';

const PERSON = {
  id: 'person-id',
  whatsAppId: '16505551234',
  whatsAppUserId: null,
  whatsAppMarketingOptOut: false,
  phones: null,
  name: { firstName: 'Ada', lastName: 'Lovelace' },
  jobTitle: null,
  city: null,
  company: null,
};

const CONTENT = { parameters: [{ personField: 'firstName' as const }], headerParameters: [] };

describe('resolveWhatsAppCampaignRecipient', () => {
  it('should send to the person with their own values', () => {
    expect(resolveWhatsAppCampaignRecipient({ person: PERSON, templateCategory: 'UTILITY', content: CONTENT })).toEqual({
      to: '16505551234',
      parameters: [{ value: 'Ada' }],
      headerParameters: [],
    });
  });

  it('should skip people without a number, opted out of marketing, or missing a value', () => {
    expect(
      resolveWhatsAppCampaignRecipient({ person: { ...PERSON, whatsAppId: null }, templateCategory: 'UTILITY', content: CONTENT }),
    ).toEqual({ skipReason: 'NO_WHATSAPP_NUMBER' });
    expect(
      resolveWhatsAppCampaignRecipient({
        person: { ...PERSON, whatsAppMarketingOptOut: true },
        templateCategory: 'MARKETING',
        content: CONTENT,
      }),
    ).toEqual({ skipReason: 'MARKETING_OPT_OUT' });
    expect(
      resolveWhatsAppCampaignRecipient({ person: { ...PERSON, name: null }, templateCategory: 'UTILITY', content: CONTENT }),
    ).toEqual({ skipReason: 'MISSING_PERSONALIZED_VALUE' });
  });
});
