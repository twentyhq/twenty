import { useNumberFormat } from '@/localization/hooks/useNumberFormat';

import { EllipsisDisplay } from 'twenty-ui/data-display';

type MoneyDisplayProps = {
  value: number | null;
};

export const MoneyDisplay = ({ value }: MoneyDisplayProps) => {
  const { formatNumber } = useNumberFormat();
  return (
    <EllipsisDisplay>{value ? `$${formatNumber(value)}` : ''}</EllipsisDisplay>
  );
};
