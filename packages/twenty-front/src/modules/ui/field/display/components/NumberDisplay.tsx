import { formatNumber } from '~/utils/format/number';

import { EllipsisDisplay } from './EllipsisDisplay';

type NumberDisplayProps = {
  value: string | number | null;
  maxWidth?: number;
};

export const NumberDisplay = ({ value, maxWidth }: NumberDisplayProps) => (
  <EllipsisDisplay maxWidth={maxWidth}>{value && formatNumber(Number(value))}</EllipsisDisplay>
);
