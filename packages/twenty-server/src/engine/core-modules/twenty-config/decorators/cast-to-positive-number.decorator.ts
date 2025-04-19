import { Transform } from 'class-transformer';

import { TypedReflect } from 'src/utils/typed-reflect';

export const CastToPositiveNumber =
  () =>
  <T extends object>(target: T, propertyKey: keyof T & string) => {
    Transform(({ value }: { value: string }) => toNumber(value))(
      target,
      propertyKey,
    );

    TypedReflect.defineMetadata(
      'config-variable:type',
      'number',
      target.constructor,
      propertyKey,
    );
  };

const toNumber = (value: any) => {
  if (typeof value === 'number') {
    return value >= 0 ? value : undefined;
  }
  if (typeof value === 'string') {
    return isNaN(+value) ? undefined : toNumber(+value);
  }

  return undefined;
};
