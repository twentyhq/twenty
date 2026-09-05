import { plural, t } from '@lingui/core/macro';

import { type CampaignAudiencePreviewDto } from '~/generated-metadata/graphql';

type ExcludedRecipientCounts = Pick<
  CampaignAudiencePreviewDto,
  | 'withoutEmail'
  | 'duplicateEmails'
  | 'hardSuppressed'
  | 'globallyUnsubscribed'
  | 'topicUnsubscribed'
  | 'overCap'
>;

export const buildExcludedRecipientReasons = ({
  counts,
  formatNumber,
}: {
  counts: ExcludedRecipientCounts;
  formatNumber: (value: number) => string;
}): string[] => {
  const reasons: string[] = [];

  if (counts.withoutEmail > 0) {
    reasons.push(
      t`${formatNumber(counts.withoutEmail)} without an email address`,
    );
  }
  if (counts.duplicateEmails > 0) {
    reasons.push(
      plural(counts.duplicateEmails, {
        one: `${formatNumber(counts.duplicateEmails)} duplicate`,
        other: `${formatNumber(counts.duplicateEmails)} duplicates`,
      }),
    );
  }
  if (counts.hardSuppressed > 0) {
    reasons.push(
      t`${formatNumber(counts.hardSuppressed)} bounced or complained`,
    );
  }
  if (counts.globallyUnsubscribed > 0) {
    reasons.push(
      t`${formatNumber(counts.globallyUnsubscribed)} unsubscribed from everything`,
    );
  }
  if (counts.topicUnsubscribed > 0) {
    reasons.push(
      t`${formatNumber(counts.topicUnsubscribed)} opted out of this topic`,
    );
  }
  if (counts.overCap > 0) {
    reasons.push(t`${formatNumber(counts.overCap)} over the recipient limit`);
  }

  return reasons;
};
