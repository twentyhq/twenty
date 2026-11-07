import { WITHDRAWN_CURRENCY_CODES } from '@/ui/input/components/internal/currency/constants/WithdrawnCurrencyCodes';

export const isCurrencyCodeSelectable = ({
  currencyCode,
  selectedCurrencyCode,
}: {
  currencyCode: string;
  selectedCurrencyCode?: string | null;
}) =>
  currencyCode === selectedCurrencyCode ||
  !WITHDRAWN_CURRENCY_CODES.includes(currencyCode);
