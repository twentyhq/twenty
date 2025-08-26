import { EllipsisDisplay } from 'twenty-ui/display';

type NumberDisplayProps = {
  value: string | number | null | undefined;
  decimals?: number;
};

export const NumberDisplay = ({ value }: NumberDisplayProps) => (
  <EllipsisDisplay>{value}</EllipsisDisplay>
);
