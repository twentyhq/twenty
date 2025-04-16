import { useCurrencyFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useCurrencyFieldDisplay';
import { CurrencyDisplay } from '@/ui/field/display/components/CurrencyDisplay';

export const CurrencyFieldDisplay = () => {
  const { fieldValue } = useCurrencyFieldDisplay();

  return <CurrencyDisplay currencyValue={fieldValue} />;
};
