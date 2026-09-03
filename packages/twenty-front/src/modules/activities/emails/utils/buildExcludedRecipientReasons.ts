import { plural, t } from '@lingui/core/macro';

type ExcludedRecipientCounts = {
  withoutEmail: number;
  duplicateEmails: number;
  hardSuppressed: number;
  globallyUnsubscribed: number;
  topicUnsubscribed: number;
  overCap: number;
};

export const buildExcludedRecipientReasons = (
  counts: ExcludedRecipientCounts,
): string[] => {
  const reasons: string[] = [];

  if (counts.withoutEmail > 0) {
    reasons.push(
      plural(counts.withoutEmail, {
        one: `${counts.withoutEmail} without an email address`,
        other: `${counts.withoutEmail} without an email address`,
      }),
    );
  }
  if (counts.duplicateEmails > 0) {
    reasons.push(
      plural(counts.duplicateEmails, {
        one: `${counts.duplicateEmails} duplicate`,
        other: `${counts.duplicateEmails} duplicates`,
      }),
    );
  }
  if (counts.hardSuppressed > 0) {
    reasons.push(t`${counts.hardSuppressed} bounced or complained`);
  }
  if (counts.globallyUnsubscribed > 0) {
    reasons.push(
      t`${counts.globallyUnsubscribed} unsubscribed from everything`,
    );
  }
  if (counts.topicUnsubscribed > 0) {
    reasons.push(t`${counts.topicUnsubscribed} opted out of this topic`);
  }
  if (counts.overCap > 0) {
    reasons.push(t`${counts.overCap} over the recipient limit`);
  }

  return reasons;
};
