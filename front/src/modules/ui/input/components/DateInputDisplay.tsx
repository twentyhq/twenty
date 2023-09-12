import { formatToHumanReadableDate } from '~/utils';

type OwnProps = {
  value: Date | string | null;
};

export function DateInputDisplay({ value }: OwnProps) {
  return <div>{value && formatToHumanReadableDate(value)}</div>;
}
