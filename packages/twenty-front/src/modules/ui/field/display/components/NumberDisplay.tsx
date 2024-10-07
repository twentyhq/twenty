import { formatNumber } from '~/utils/format/number';

import { EllipsisDisplay } from './EllipsisDisplay';

type NumberDisplayProps = {
  value: string | number | null | undefined;
  decimals?: number;
};

export const NumberDisplay = ({ value, decimals }: NumberDisplayProps) => (
  <EllipsisDisplay>
    {value && formatNumber(Number(value), decimals)}
  </EllipsisDisplay>
);
