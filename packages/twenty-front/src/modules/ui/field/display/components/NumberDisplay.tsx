import { EllipsisDisplay } from './EllipsisDisplay';

type NumberDisplayProps = {
  value: string | number | null | undefined;
  decimals?: number;
};

export const NumberDisplay = ({ value }: NumberDisplayProps) => (
  <EllipsisDisplay>{value}</EllipsisDisplay>
);
