import { plural } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FormatNumberOptions } from '@/localization/utils/formatNumber';
import { getCurrencyPrefix } from '@/localization/utils/getCurrencyPrefix';
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

export const formatSubscriptionItemValue = ({
  item,
  currency,
  formatNumber,
}: FormatSubscriptionItemValueArgs): string => {
  const parts: string[] = [];

  if (isDefined(item.quantity)) {
    // Metered items carry a Stripe bookkeeping quantity that bills nothing, so only licensed base items are seats.
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
      `${getCurrencyPrefix(currency)}${formatNumber(item.unitAmount / 100, {
        decimals: 2,
      })}`,
    );
  }

  return parts.length > 0 ? parts.join(' · ') : EM_DASH;
};
