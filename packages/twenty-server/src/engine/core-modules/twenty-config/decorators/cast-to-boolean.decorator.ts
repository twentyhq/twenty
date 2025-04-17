import { Transform } from 'class-transformer';

import { TypedReflect } from 'src/utils/typed-reflect';

export const CastToBoolean =
  () =>
  <T extends object>(target: T, propertyKey: keyof T & string) => {
    Transform(({ value }: { value: string }) => toBoolean(value))(
      target,
      propertyKey,
    );

    TypedReflect.defineMetadata(
      'config-variable:type',
      'boolean',
      target.constructor,
      propertyKey,
    );
  };

const toBoolean = (value: any) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (['true', 'on', 'yes', '1'].includes(value?.toLowerCase())) {
    return true;
  }
  if (['false', 'off', 'no', '0'].includes(value?.toLowerCase())) {
    return false;
  }

  return undefined;
};
