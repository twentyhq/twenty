import { EllipsisDisplay } from 'twenty-ui/display';
import { formatNumber } from '~/utils/format/number';

type MoneyDisplayProps = {
  value: number | null;
};

export const MoneyDisplay = ({ value }: MoneyDisplayProps) => (
  <EllipsisDisplay>{value ? `$${formatNumber(value)}` : ''}</EllipsisDisplay>
);
