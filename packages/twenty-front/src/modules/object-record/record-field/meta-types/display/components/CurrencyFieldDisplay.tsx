import { CurrencyDisplay } from '@/ui/field/display/components/CurrencyDisplay';

import { useCurrencyField } from '../../hooks/useCurrencyField';

export const CurrencyFieldDisplay = () => {
  const { initialAmount } = useCurrencyField();

  return <CurrencyDisplay amount={initialAmount} />;
};
