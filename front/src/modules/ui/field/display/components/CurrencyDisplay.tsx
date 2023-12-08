import { EllipsisDisplay } from './EllipsisDisplay';

type CurrencyDisplayProps = {
  amount?: number | null;
};

// TODO: convert currencyCode to currency symbol
export const CurrencyDisplay = ({ amount }: CurrencyDisplayProps) => {
  return <EllipsisDisplay>{amount}</EllipsisDisplay>;
};
