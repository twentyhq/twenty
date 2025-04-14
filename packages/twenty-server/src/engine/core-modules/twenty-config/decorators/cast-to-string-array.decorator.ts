import { Transform } from 'class-transformer';

export const CastToStringArray = () =>
  Transform(({ value }: { value: string }) => toStringArray(value));

const toStringArray = (value: any) => {
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim());
  }

  return undefined;
};
