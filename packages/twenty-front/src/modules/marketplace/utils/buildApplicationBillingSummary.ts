import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IconCreditCard } from 'twenty-ui/icon';

import { type PermissionSummaryItem } from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';

export const buildApplicationBillingSummary = ({
  billsCredits,
  pricingDescription,
}: {
  billsCredits: boolean;
  pricingDescription?: string;
}): PermissionSummaryItem[] => {
  if (!billsCredits) {
    return [];
  }

  return [
    {
      Icon: IconCreditCard,
      label: isNonEmptyString(pricingDescription)
        ? t`Bill credits to your workspace (${pricingDescription})`
        : t`Bill credits to your workspace`,
    },
  ];
};
