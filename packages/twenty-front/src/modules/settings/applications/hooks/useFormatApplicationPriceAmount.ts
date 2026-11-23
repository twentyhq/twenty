import { useCallback } from 'react';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { getCurrencyPrefix } from '@/localization/utils/getCurrencyPrefix';

export const useFormatApplicationPriceAmount = () => {
  const { formatNumber } = useNumberFormat();

  const formatApplicationPriceAmount = useCallback(
    ({ amountCents, currency }: { amountCents: number; currency: string }) =>
      `${getCurrencyPrefix(currency)}${formatNumber(amountCents / 100, {
        decimals: 2,
        minimumDecimals: 2,
      })}`,
    [formatNumber],
  );

  return { formatApplicationPriceAmount };
};
