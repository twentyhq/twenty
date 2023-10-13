import { useMoneyField } from '../../hooks/useMoneyField';
import { MoneyDisplay } from '../content-display/components/MoneyDisplay';

export const MoneyFieldDisplay = () => {
  const { fieldValue } = useMoneyField();

  return <MoneyDisplay value={fieldValue} />;
};
