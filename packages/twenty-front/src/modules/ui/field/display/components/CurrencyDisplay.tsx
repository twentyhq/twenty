import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { CurrencyDisplayWithIcons } from '@/ui/field/display/components/CurrencyDisplayWithIcon';

import { EllipsisDisplay } from './EllipsisDisplay';

type CurrencyDisplayProps = {
  amount?: number | null;
};

export const CurrencyDisplay = ({ amount }: CurrencyDisplayProps) => {
  const { showCurrencySymbol, currencyValues } = useContext(FieldContext);
  return (
    <EllipsisDisplay>
      {showCurrencySymbol && (
        <CurrencyDisplayWithIcons currencyValues={currencyValues} />
      )}
      {amount}
    </EllipsisDisplay>
  );
};
