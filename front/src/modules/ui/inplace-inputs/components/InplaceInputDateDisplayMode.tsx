import { formatToHumanReadableDate } from '@/utils/utils';

type OwnProps = {
  value: Date;
};

export function InplaceInputDateDisplayMode({ value }: OwnProps) {
  return <div>{value && formatToHumanReadableDate(value)}</div>;
}
