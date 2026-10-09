import { type NumberFormat } from '@/localization/constants/NumberFormat';
import { formatNumber } from '@/localization/utils/formatNumber';

export const formatOnboardingCredits = (
  credits: number,
  numberFormat: NumberFormat,
) => formatNumber(credits, { decimals: 2, format: numberFormat });
