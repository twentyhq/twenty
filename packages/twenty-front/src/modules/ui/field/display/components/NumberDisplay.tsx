import { EllipsisDisplay } from './EllipsisDisplay';

type NumberDisplayProps = {
  value: string | number | null | undefined;
  decimals?: number;
  color?: string;
};

export const NumberDisplay = ({ value, color }: NumberDisplayProps) => (
  <EllipsisDisplay color={color}>{value}</EllipsisDisplay>
);
