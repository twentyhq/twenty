import { formatNumber } from '~/utils/format/number';

import { EllipsisDisplay } from './EllipsisDisplay';

type MoneyDisplayProps = {
  value: number | null;
};

export const MoneyDisplay = ({ value }: MoneyDisplayProps) => (
  <EllipsisDisplay>{value ? `$${formatNumber(value)}` : ''}</EllipsisDisplay>
);
