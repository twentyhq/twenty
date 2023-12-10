import { formatNumber } from '~/utils/format/number';

import { EllipsisDisplay } from './EllipsisDisplay';

type NumberDisplayProps = {
  value: string | number | null;
};

export const NumberDisplay = ({ value }: NumberDisplayProps) => (
  <EllipsisDisplay>{value && formatNumber(Number(value))}</EllipsisDisplay>
);
