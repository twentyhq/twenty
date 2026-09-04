import { buildExcludedRecipientReasons } from '@/activities/emails/utils/buildExcludedRecipientReasons';

const NO_EXCLUSIONS = {
  totalMembers: 0,
  sendable: 0,
  withoutEmail: 0,
  duplicateEmails: 0,
  hardSuppressed: 0,
  globallyUnsubscribed: 0,
  topicUnsubscribed: 0,
  overCap: 0,
};

describe('buildExcludedRecipientReasons', () => {
  it('returns nothing when no recipient was excluded', () => {
    expect(buildExcludedRecipientReasons(NO_EXCLUSIONS)).toEqual([]);
  });

  it('names only the reasons that actually excluded someone', () => {
    expect(
      buildExcludedRecipientReasons({ ...NO_EXCLUSIONS, hardSuppressed: 3 }),
    ).toEqual(['3 bounced or complained']);
  });

  it('pluralises the duplicate count', () => {
    expect(
      buildExcludedRecipientReasons({ ...NO_EXCLUSIONS, duplicateEmails: 1 }),
    ).toEqual(['1 duplicate']);
    expect(
      buildExcludedRecipientReasons({ ...NO_EXCLUSIONS, duplicateEmails: 2 }),
    ).toEqual(['2 duplicates']);
  });

  it('lists every reason that applies, in a stable order', () => {
    expect(
      buildExcludedRecipientReasons({
        totalMembers: 21,
        sendable: 0,
        withoutEmail: 1,
        duplicateEmails: 2,
        hardSuppressed: 3,
        globallyUnsubscribed: 4,
        topicUnsubscribed: 5,
        overCap: 6,
      }),
    ).toEqual([
      '1 without an email address',
      '2 duplicates',
      '3 bounced or complained',
      '4 unsubscribed from everything',
      '5 opted out of this topic',
      '6 over the recipient limit',
    ]);
  });
});
