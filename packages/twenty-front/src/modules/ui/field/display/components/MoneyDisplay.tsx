import { formatNumber } from '~/utils/format/formatNumber';

import { EllipsisDisplay } from './EllipsisDisplay';

type MoneyDisplayProps = {
  value: number | null;
};

export const MoneyDisplay = ({ value }: MoneyDisplayProps) => (
  <EllipsisDisplay>{value ? `$${formatNumber(value)}` : ''}</EllipsisDisplay>
);
