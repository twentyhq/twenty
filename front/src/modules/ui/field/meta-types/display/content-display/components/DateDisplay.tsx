import { formatToHumanReadableDate } from '~/utils';

type OwnProps = {
  value: Date | string | null | undefined;
};

export const DateDisplay = ({ value }: OwnProps) => (
  <div>{value && formatToHumanReadableDate(value)}</div>
);
