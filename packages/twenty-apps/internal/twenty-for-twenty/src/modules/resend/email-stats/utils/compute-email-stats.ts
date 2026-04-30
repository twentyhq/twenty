import {
  EMAIL_STATUS_GROUP_BY_STATUS,
  isResendEmailStatus,
  type EmailStatusGroup,
  type ResendEmailStatus,
} from '@modules/resend/email-stats/constants/email-status-groups';

export type EmailStatsInput = ReadonlyArray<{
  lastEvent?: string | null;
}>;

export type EmailStats = {
  total: number;
  countsByStatus: Record<ResendEmailStatus, number>;
  groupCounts: Record<EmailStatusGroup, number>;
  deliverabilityRate: number | null;
};

const buildEmptyStatusCounts = (): Record<ResendEmailStatus, number> => ({
  SENT: 0,
  DELIVERED: 0,
  DELIVERY_DELAYED: 0,
  COMPLAINED: 0,
  BOUNCED: 0,
  OPENED: 0,
  CLICKED: 0,
  SCHEDULED: 0,
  QUEUED: 0,
  FAILED: 0,
  CANCELED: 0,
  RECEIVED: 0,
  SUPPRESSED: 0,
});

const buildEmptyGroupCounts = (): Record<EmailStatusGroup, number> => ({
  reached: 0,
  failed: 0,
  inFlight: 0,
  other: 0,
});

export const computeEmailStats = (emails: EmailStatsInput): EmailStats => {
  const countsByStatus = buildEmptyStatusCounts();
  const groupCounts = buildEmptyGroupCounts();
  let total = 0;

  for (const email of emails) {
    const status = email.lastEvent;

    if (!isResendEmailStatus(status)) {
      continue;
    }

    countsByStatus[status] += 1;
    groupCounts[EMAIL_STATUS_GROUP_BY_STATUS[status]] += 1;
    total += 1;
  }

  const deliverabilityDenominator = groupCounts.reached + groupCounts.failed;
  const deliverabilityRate =
    deliverabilityDenominator > 0
      ? groupCounts.reached / deliverabilityDenominator
      : null;

  return {
    total,
    countsByStatus,
    groupCounts,
    deliverabilityRate,
  };
};
