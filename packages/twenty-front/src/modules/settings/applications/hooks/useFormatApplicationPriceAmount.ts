import { useCallback } from 'react';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { formatApplicationPriceAmount as formatApplicationPriceAmountUtil } from '@/settings/applications/utils/formatApplicationPriceAmount';

export const useFormatApplicationPriceAmount = () => {
  const { numberFormat } = useNumberFormat();

  const formatApplicationPriceAmount = useCallback(
    ({ amountCents, currency }: { amountCents: number; currency: string }) =>
      formatApplicationPriceAmountUtil({ amountCents, currency, numberFormat }),
    [numberFormat],
  );

  return { formatApplicationPriceAmount };
};
