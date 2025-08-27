import { useCurrencyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useCurrencyFieldDisplay';
import { CurrencyDisplay } from '@/ui/field/display/components/CurrencyDisplay';

export const CurrencyFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useCurrencyFieldDisplay();

  return (
    <CurrencyDisplay
      currencyValue={fieldValue}
      fieldDefinition={fieldDefinition}
    />
  );
};
