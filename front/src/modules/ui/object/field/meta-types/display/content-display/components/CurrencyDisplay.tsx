import { FieldCurrencyValue } from '@/ui/object/field/types/FieldMetadata';
import { convertCurrencyMicrosToCurrency } from '~/utils/convert-currency-amount';

import { EllipsisDisplay } from './EllipsisDisplay';

type CurrencyDisplayProps = {
  value?: FieldCurrencyValue;
};

// TODO: convert currencyCode to currency symbol
export const CurrencyDisplay = ({ value }: CurrencyDisplayProps) => {
  return (
    <EllipsisDisplay>
      {convertCurrencyMicrosToCurrency(value?.amountMicros)}{' '}
      {value?.currencyCode}
    </EllipsisDisplay>
  );
};
