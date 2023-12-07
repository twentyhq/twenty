import { useCurrencyField } from '../../hooks/useCurrencyField';
import { CurrencyDisplay } from '../content-display/components/CurrencyDisplay';

export const CurrencyFieldDisplay = () => {
  const { initialAmount } = useCurrencyField();

  return <CurrencyDisplay amount={initialAmount} />;
};
