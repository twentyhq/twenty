import { Transform } from 'class-transformer';

export const CastToPositiveNumber = () =>
  Transform(({ value }: { value: string }) => toNumber(value));

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return value >= 0 ? value : undefined;
  }
  if (typeof value === 'string') {
    return isNaN(+value) ? undefined : toNumber(+value);
  }

  return undefined;
};
