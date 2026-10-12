import { t } from '@lingui/core/macro';
import { IconCreditCard } from 'twenty-ui/icon';

import { type PermissionSummaryItem } from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';

export const buildApplicationBillingSummary = (
  billsCredits: boolean,
): PermissionSummaryItem[] =>
  billsCredits
    ? [{ Icon: IconCreditCard, label: t`Bill credits to your workspace` }]
    : [];
