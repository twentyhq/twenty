import { plural, t } from '@lingui/core/macro';

import { type CampaignAudiencePreview } from '@/activities/emails/types/CampaignAudiencePreview';

export const buildExcludedRecipientReasons = (
  counts: CampaignAudiencePreview,
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
