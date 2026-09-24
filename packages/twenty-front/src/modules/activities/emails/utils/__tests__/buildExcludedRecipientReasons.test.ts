import { buildExcludedRecipientReasons } from '@/activities/emails/utils/buildExcludedRecipientReasons';
import { formatNumber } from '~/utils/format/formatNumber';

const NO_EXCLUSIONS = {
  withoutEmail: 0,
  duplicateEmails: 0,
  hardSuppressed: 0,
  globallyUnsubscribed: 0,
  topicUnsubscribed: 0,
  overCap: 0,
};

describe('buildExcludedRecipientReasons', () => {
  it('returns nothing when no recipient was excluded', () => {
    expect(
      buildExcludedRecipientReasons({ counts: NO_EXCLUSIONS, formatNumber }),
    ).toEqual([]);
  });

  it('names only the reasons that actually excluded someone', () => {
    expect(
      buildExcludedRecipientReasons({
        counts: { ...NO_EXCLUSIONS, hardSuppressed: 3 },
        formatNumber,
      }),
    ).toEqual(['3 bounced or complained']);
  });

  it('pluralises the duplicate count', () => {
    expect(
      buildExcludedRecipientReasons({
        counts: { ...NO_EXCLUSIONS, duplicateEmails: 1 },
        formatNumber,
      }),
    ).toEqual(['1 duplicate']);
    expect(
      buildExcludedRecipientReasons({
        counts: { ...NO_EXCLUSIONS, duplicateEmails: 2 },
        formatNumber,
      }),
    ).toEqual(['2 duplicates']);
  });

  it('formats large counts with the given formatter', () => {
    expect(
      buildExcludedRecipientReasons({
        counts: { ...NO_EXCLUSIONS, overCap: 8300 },
        formatNumber,
      }),
    ).toEqual(['8,300 over the recipient limit']);
  });

  it('lists every reason that applies, in a stable order', () => {
    expect(
      buildExcludedRecipientReasons({
        counts: {
          withoutEmail: 1,
          duplicateEmails: 2,
          hardSuppressed: 3,
          globallyUnsubscribed: 4,
          topicUnsubscribed: 5,
          overCap: 6,
        },
        formatNumber,
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
