import { formatToHumanReadableDate } from '~/utils';

type DateDisplayProps = {
  value: Date | string | null | undefined;
};

export const DateDisplay = ({ value }: DateDisplayProps) => (
  <div>{value && formatToHumanReadableDate(value)}</div>
);
