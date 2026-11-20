import { describe, expect, it } from 'vitest';
import { buildWhatsAppCampaignSkipRecordInputs } from 'src/logic-functions/data/build-whatsapp-campaign-skip-record-inputs.util';

describe('buildWhatsAppCampaignSkipRecordInputs', () => {
  it('should name each skipped person, including unnamed and deleted ones', () => {
    expect(
      buildWhatsAppCampaignSkipRecordInputs({
        campaignId: 'campaign-id',
        skips: [
          { person: { id: 'ada', name: { firstName: 'Ada', lastName: 'Lovelace' } }, reason: 'MARKETING_OPT_OUT' },
          { person: { id: 'unnamed', name: null }, reason: 'NO_WHATSAPP_NUMBER' },
          { person: null, reason: 'PERSON_DELETED' },
        ],
      }),
    ).toEqual([
      { campaignId: 'campaign-id', personId: 'ada', reason: 'MARKETING_OPT_OUT', recipientName: 'Ada Lovelace' },
      { campaignId: 'campaign-id', personId: 'unnamed', reason: 'NO_WHATSAPP_NUMBER', recipientName: 'Unnamed person' },
      { campaignId: 'campaign-id', personId: null, reason: 'PERSON_DELETED', recipientName: 'Deleted person' },
    ]);
  });
});
