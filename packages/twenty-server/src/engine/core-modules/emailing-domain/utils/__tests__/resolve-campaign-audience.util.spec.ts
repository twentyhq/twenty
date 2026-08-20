import { type RawCampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/raw-campaign-recipient.type';
import { resolveCampaignAudience } from 'src/engine/core-modules/emailing-domain/utils/resolve-campaign-audience.util';

const buildRawRecipients = (
  emails: (string | null)[],
): RawCampaignRecipient[] =>
  emails.map((email, index) => ({ personId: `person-${index}`, email }));

describe('resolveCampaignAudience', () => {
  it('should report the sendable count as the number of recipients it returns', () => {
    const { sendableRecipients, audience } = resolveCampaignAudience({
      rawRecipients: buildRawRecipients([
        'alice@example.com',
        null,
        'ALICE@example.com',
        'bob@example.com',
        'carol@example.com',
      ]),
      maxRecipients: 100,
      globallySuppressedEmails: new Set(['bob@example.com']),
      topicSuppressedEmails: new Set(['carol@example.com']),
    });

    expect(sendableRecipients).toEqual([
      { email: 'alice@example.com', personId: 'person-0' },
    ]);
    expect(audience).toEqual({
      totalMembers: 5,
      withoutEmail: 1,
      duplicateEmails: 1,
      overCap: 0,
      globallyUnsubscribed: 1,
      topicUnsubscribed: 1,
      sendable: 1,
    });
  });

  it('should surface how many recipients were dropped for exceeding the cap', () => {
    const { sendableRecipients, audience } = resolveCampaignAudience({
      rawRecipients: buildRawRecipients([
        'a@example.com',
        'b@example.com',
        'c@example.com',
      ]),
      maxRecipients: 2,
      globallySuppressedEmails: new Set(),
      topicSuppressedEmails: new Set(),
    });

    expect(audience.overCap).toBe(1);
    expect(audience.sendable).toBe(2);
    expect(sendableRecipients).toHaveLength(2);
  });

  it('should count a globally suppressed recipient once even when the topic also suppresses it', () => {
    const { audience } = resolveCampaignAudience({
      rawRecipients: buildRawRecipients(['dave@example.com']),
      maxRecipients: 100,
      globallySuppressedEmails: new Set(['dave@example.com']),
      topicSuppressedEmails: new Set(['dave@example.com']),
    });

    expect(audience.globallyUnsubscribed).toBe(1);
    expect(audience.topicUnsubscribed).toBe(0);
    expect(audience.sendable).toBe(0);
  });

  it('should return an empty audience when the list has no members', () => {
    const { sendableRecipients, audience } = resolveCampaignAudience({
      rawRecipients: [],
      maxRecipients: 100,
      globallySuppressedEmails: new Set(),
      topicSuppressedEmails: new Set(),
    });

    expect(sendableRecipients).toEqual([]);
    expect(audience.totalMembers).toBe(0);
    expect(audience.sendable).toBe(0);
  });
});
