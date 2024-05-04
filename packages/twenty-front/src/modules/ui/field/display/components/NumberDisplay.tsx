import { EllipsisDisplayV2 } from '@/ui/field/display/components/EllipsisDisplayV2';
import { formatNumber } from '~/utils/format/number';

type NumberDisplayProps = {
  value: string | number | null;
};

export const NumberDisplay = ({ value }: NumberDisplayProps) => (
  <EllipsisDisplayV2>{value && formatNumber(Number(value))}</EllipsisDisplayV2>
);
