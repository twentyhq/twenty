import { CurrencyDisplay } from 'twenty-ui';

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
