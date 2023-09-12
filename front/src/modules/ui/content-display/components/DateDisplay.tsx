import { formatToHumanReadableDate } from '~/utils';

type OwnProps = {
  value: Date | string | null | undefined;
};

export function DateDisplay({ value }: OwnProps) {
  return <div>{value && formatToHumanReadableDate(value)}</div>;
}
