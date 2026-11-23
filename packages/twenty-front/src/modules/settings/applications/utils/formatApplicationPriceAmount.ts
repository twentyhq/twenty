import { type NumberFormat } from '@/localization/constants/NumberFormat';
import { formatNumber } from '@/localization/utils/formatNumber';
import { getCurrencyPrefix } from '@/localization/utils/getCurrencyPrefix';

export const formatApplicationPriceAmount = ({
  amountCents,
  currency,
  numberFormat,
}: {
  amountCents: number;
  currency: string;
  numberFormat: NumberFormat;
}): string =>
  `${getCurrencyPrefix(currency)}${formatNumber(amountCents / 100, {
    decimals: 2,
    minimumDecimals: 2,
    format: numberFormat,
  })}`;
