import { plural } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FormatNumberOptions } from '~/utils/format/formatNumber';
import { BillingProductKey } from '~/generated-metadata/graphql';

const EM_DASH = '—';

type SubscriptionItem = {
  productKey?: string | null;
  quantity?: number | null;
  includedCredits?: number | null;
  unitAmount?: number | null;
};

type FormatSubscriptionItemValueArgs = {
  item: SubscriptionItem;
  currency: string;
  formatNumber: (
    value: number,
    options?: Omit<FormatNumberOptions, 'format'>,
  ) => string;
};

// Only the symbol comes from Intl. The digits go through formatNumber like
// every other number on the page, so an amount does not ignore the workspace
// member's number format while the counts beside it honour it.
const getCurrencySymbol = (currency: string): string => {
  const normalizedCurrency = currency.toUpperCase();

  try {
    return (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: normalizedCurrency,
      })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value ?? normalizedCurrency
    );
  } catch {
    return normalizedCurrency;
  }
};

export const formatSubscriptionItemValue = ({
  item,
  currency,
  formatNumber,
}: FormatSubscriptionItemValueArgs): string => {
  const parts: string[] = [];

  if (isDefined(item.quantity)) {
    // Only a licensed base-product item sells seats. A metered item carries a
    // Stripe bookkeeping quantity that bills nothing, so naming it seats states
    // something untrue about what the workspace is paying for.
    parts.push(
      item.productKey === BillingProductKey.BASE_PRODUCT
        ? `${formatNumber(item.quantity)} ${plural(item.quantity, {
            one: 'seat',
            other: 'seats',
          })}`
        : formatNumber(item.quantity),
    );
  }

  if (isDefined(item.includedCredits)) {
    parts.push(
      `${formatNumber(item.includedCredits, {
        abbreviate: true,
        decimals: 2,
      })} ${plural(item.includedCredits, {
        one: 'credit/period',
        other: 'credits/period',
      })}`,
    );
  }

  if (isDefined(item.unitAmount)) {
    parts.push(
      `${getCurrencySymbol(currency)}${formatNumber(item.unitAmount / 100, {
        decimals: 2,
      })}`,
    );
  }

  return parts.length > 0 ? parts.join(' · ') : EM_DASH;
};
