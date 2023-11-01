import { useMoneyAmountV2Field } from '../../hooks/useMoneyAmountV2Field';
import { MoneyAmountV2Display } from '../content-display/components/MoneyAmountV2Display';

export const MoneyAmountV2FieldDisplay = () => {
  const { fieldValue } = useMoneyAmountV2Field();

  return <MoneyAmountV2Display value={fieldValue} />;
};
