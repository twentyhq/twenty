import { t } from '@lingui/core/macro';
import { IconCreditCard } from 'twenty-ui/icon';

import { type PermissionSummaryItem } from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';
import { type ApplicationBillingPrice } from '~/generated-metadata/graphql';

const getApplicationBillingPriceLabel = ({
  price,
  formattedAmount: amount,
  appDisplayName,
}: {
  price: Pick<ApplicationBillingPrice, 'type' | 'billingPeriod' | 'per'>;
  formattedAmount: string;
  appDisplayName: string;
}): string => {
  const isMonthly =
    price.type === 'RECURRING' && price.billingPeriod === 'MONTHLY';

  switch (price.per) {
    case 'CONNECTED_ACCOUNT':
      return isMonthly
        ? t`Bill your workspace ${amount} for each ${appDisplayName} connected account each month`
        : t`Bill your workspace ${amount} once for each ${appDisplayName} connected account`;
    case 'WORKSPACE_MEMBER':
      return isMonthly
        ? t`Bill your workspace ${amount} for each workspace member each month`
        : t`Bill your workspace ${amount} once for each workspace member`;
    default:
      return isMonthly
        ? t`Bill your workspace ${amount} each month`
        : t`Bill your workspace ${amount} once`;
  }
};

export const buildApplicationBillingSummary = ({
  billsCredits,
  billingPrices,
  appDisplayName,
  formatPriceAmount,
}: {
  billsCredits: boolean;
  billingPrices: ApplicationBillingPrice[];
  appDisplayName: string;
  formatPriceAmount: (price: ApplicationBillingPrice) => string;
}): PermissionSummaryItem[] => [
  ...billingPrices.map((price) => ({
    Icon: IconCreditCard,
    label: getApplicationBillingPriceLabel({
      price,
      formattedAmount: formatPriceAmount(price),
      appDisplayName,
    }),
  })),
  ...(billsCredits
    ? [{ Icon: IconCreditCard, label: t`Bill credits to your workspace` }]
    : []),
];
