import { type RawCampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/raw-campaign-recipient.type';
import { normalizeCampaignRecipients } from 'src/engine/core-modules/emailing-domain/utils/normalize-campaign-recipients.util';

describe('normalizeCampaignRecipients', () => {
  it('drops people with no email and reports them', () => {
    const raw: RawCampaignRecipient[] = [
      { personId: 'p1', email: 'a@example.com' },
      { personId: 'p2', email: null },
      { personId: 'p3', email: '   ' },
    ];

    const { recipients, skipped } = normalizeCampaignRecipients(raw);

    expect(recipients).toEqual([{ personId: 'p1', email: 'a@example.com' }]);
    expect(skipped).toEqual({ noEmail: 2, deduped: 0 });
  });

  it('dedupes by lowercased email, keeping the first occurrence', () => {
    const raw: RawCampaignRecipient[] = [
      { personId: 'p1', email: 'A@Example.com' },
      { personId: 'p2', email: 'a@example.com' },
    ];

    const { recipients, skipped } = normalizeCampaignRecipients(raw);

    expect(recipients).toEqual([{ personId: 'p1', email: 'a@example.com' }]);
    expect(skipped.deduped).toBe(1);
  });

  it('returns an empty result for no input', () => {
    expect(normalizeCampaignRecipients([])).toEqual({
      recipients: [],
      skipped: { noEmail: 0, deduped: 0 },
    });
  });
});
