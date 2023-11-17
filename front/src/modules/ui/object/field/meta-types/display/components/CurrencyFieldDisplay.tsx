import { useCurrencyField } from '../../hooks/useCurrencyField';
import { CurrencyDisplay } from '../content-display/components/CurrencyDisplay';

export const CurrencyFieldDisplay = () => {
  const { fieldValue } = useCurrencyField();

  return <CurrencyDisplay value={fieldValue} />;
};
