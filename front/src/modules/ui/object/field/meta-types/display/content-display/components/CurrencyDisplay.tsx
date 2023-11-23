import { FieldCurrencyValue } from '@/ui/object/field/types/FieldMetadata';

import { EllipsisDisplay } from './EllipsisDisplay';

type CurrencyDisplayProps = {
  value?: FieldCurrencyValue;
};

// TODO: convert currencyCode to currency symbol
export const CurrencyDisplay = ({ value }: CurrencyDisplayProps) => {
  const amount = value?.amount;
  return <EllipsisDisplay>{amount}</EllipsisDisplay>;
};
