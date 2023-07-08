import { humanReadableDate } from '@/utils/utils';

type OwnProps = {
  value: Date;
};

export function InplaceInputDateDisplayMode({ value }: OwnProps) {
  return <div>{value && humanReadableDate(value)}</div>;
}
