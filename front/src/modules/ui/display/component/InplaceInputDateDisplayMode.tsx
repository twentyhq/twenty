import { formatToHumanReadableDate } from '~/utils';

type OwnProps = {
  value: Date | string | null;
};

export function InplaceInputDateDisplayMode({ value }: OwnProps) {
  return <div>{value && formatToHumanReadableDate(value)}</div>;
}
