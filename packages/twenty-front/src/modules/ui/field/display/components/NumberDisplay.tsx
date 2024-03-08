import { formatNumber } from '~/utils/format/formatNumber';

import { EllipsisDisplay } from './EllipsisDisplay';

type NumberDisplayProps = {
  value: string | number | null;
};

export const NumberDisplay = ({ value }: NumberDisplayProps) => (
  <EllipsisDisplay>{value && formatNumber(Number(value))}</EllipsisDisplay>
);
