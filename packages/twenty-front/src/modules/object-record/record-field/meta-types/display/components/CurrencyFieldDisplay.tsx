import { CurrencyDisplay } from '@/ui/field/display/components/CurrencyDisplay';

import { useCurrencyField } from '../../hooks/useCurrencyField';

export const CurrencyFieldDisplay = () => {
  const { fieldValue } = useCurrencyField();

  return <CurrencyDisplay currencyValue={fieldValue} />;
};
