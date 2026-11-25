import { describe, expect, it } from 'vitest';
import { selectWhatsAppCampaignResendPersonIds } from 'src/logic-functions/data/select-whatsapp-campaign-resend-person-ids.util';

const RECIPIENTS = [
  { personId: 'failed', status: 'FAILED', hasReplied: false },
  { personId: 'silent', status: 'READ', hasReplied: false },
  { personId: 'replied', status: 'READ', hasReplied: true },
  { personId: null, status: 'FAILED', hasReplied: false },
];

describe('selectWhatsAppCampaignResendPersonIds', () => {
  it('should pick the people whose message failed', () => {
    expect(selectWhatsAppCampaignResendPersonIds({ recipients: RECIPIENTS, audience: 'FAILED' })).toEqual(['failed']);
  });

  it('should pick everyone who did not reply', () => {
    expect(selectWhatsAppCampaignResendPersonIds({ recipients: RECIPIENTS, audience: 'NOT_REPLIED' })).toEqual([
      'failed',
      'silent',
    ]);
  });
});
