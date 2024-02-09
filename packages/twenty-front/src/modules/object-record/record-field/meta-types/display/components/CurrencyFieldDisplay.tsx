import { CurrencyDisplay } from '@/ui/field/display/components/CurrencyDisplay';

import { useCurrencyField } from '../../hooks/useCurrencyField';

export const CurrencyFieldDisplay = () => {
  const { fieldValue } = useCurrencyField();

  return (
    <CurrencyDisplay
      amount={
        fieldValue?.amountMicros ? fieldValue.amountMicros / 1000000 : null
      }
    />
  );
};
