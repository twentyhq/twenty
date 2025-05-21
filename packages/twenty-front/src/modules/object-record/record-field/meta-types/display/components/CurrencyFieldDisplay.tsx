import { useCurrencyFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useCurrencyFieldDisplay';
import { CurrencyDisplay } from '@/ui/field/display/components/CurrencyDisplay';

export const CurrencyFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useCurrencyFieldDisplay();
  const format = fieldDefinition.metadata.settings?.format ?? 'short';

  return <CurrencyDisplay currencyValue={fieldValue} format={format} />;
};
