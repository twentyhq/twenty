import { Transform } from 'class-transformer';

export const CastToPositiveNumber = () =>
  Transform(({ value }: { value: string }) => toNumber(value));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toNumber = (value: any) => {
  if (typeof value === 'number') {
    return value >= 0 ? value : undefined;
  }
  if (typeof value === 'string') {
    return isNaN(+value) ? undefined : toNumber(+value);
  }

  return undefined;
};
