import { t } from '@lingui/core/macro';
import { IconCreditCard } from 'twenty-ui/icon';

import { type PermissionSummaryItem } from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';

export const buildApplicationBillingSummary = (
  isPaid: boolean,
): PermissionSummaryItem[] =>
  isPaid ? [{ Icon: IconCreditCard, label: t`Bill your workspace` }] : [];
