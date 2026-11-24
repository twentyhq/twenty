import { t } from '@lingui/core/macro';
import { IconCreditCard, IconPlug } from 'twenty-ui/icon';

import { type PermissionSummaryItem } from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';
import {
  type ApplicationBillingPrice,
  ApplicationBillingPriceUnit,
} from '~/generated-metadata/graphql';

type BillingPrice = Pick<
  ApplicationBillingPrice,
  'amountCents' | 'currency' | 'per'
>;

const getPriceLabel = ({
  amount,
  per,
}: {
  amount: string;
  per: BillingPrice['per'];
}): string => {
  switch (per) {
    case ApplicationBillingPriceUnit.CONNECTED_ACCOUNT:
      return t`Bill your workspace ${amount} / month per account`;
    case ApplicationBillingPriceUnit.WORKSPACE_MEMBER:
      return t`Bill your workspace ${amount} / month per member`;
    default:
      return t`Bill your workspace ${amount} / month`;
  }
};

export const buildApplicationBillingSummary = ({
  billsCredits,
  billingPrices,
  formatAmount,
}: {
  billsCredits: boolean;
  billingPrices: BillingPrice[];
  formatAmount: (
    price: Pick<BillingPrice, 'amountCents' | 'currency'>,
  ) => string;
}): PermissionSummaryItem[] => [
  ...billingPrices.map((price) => ({
    Icon: IconCreditCard,
    label: getPriceLabel({ amount: formatAmount(price), per: price.per }),
  })),
  ...(billingPrices.some(
    ({ per }) => per === ApplicationBillingPriceUnit.CONNECTED_ACCOUNT,
  )
    ? [{ Icon: IconPlug, label: t`Let members connect their own accounts` }]
    : []),
  ...(billsCredits
    ? [{ Icon: IconCreditCard, label: t`Bill credits to your workspace` }]
    : []),
];
