import { CURRENCY_CODE_ICONS } from '@/ui/input/components/internal/currency/constants/CurrencyCodeIcons';
import { type Currency } from '@/ui/input/components/internal/types/Currency';
import { CURRENCY_CODE_LABELS } from 'twenty-shared/constants';
import { typedObjectEntries } from 'twenty-shared/utils';

export const CURRENCIES: Currency[] = typedObjectEntries(
  CURRENCY_CODE_LABELS,
).map(([code, { label }]) => ({
  value: code,
  Icon: CURRENCY_CODE_ICONS[code],
  label: `${label} (${code})`,
}));
