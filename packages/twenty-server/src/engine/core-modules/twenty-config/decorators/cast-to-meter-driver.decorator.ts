import { Transform } from 'class-transformer';

import { MeterDriver } from 'src/engine/core-modules/metrics/types/meter-driver.type';
import { TypedReflect } from 'src/utils/typed-reflect';

export const CastToMeterDriverArray =
  () =>
  <T extends object>(target: T, propertyKey: keyof T & string) => {
    Transform(({ value }: { value: string }) => toMeterDriverArray(value))(
      target,
      propertyKey,
    );

    TypedReflect.defineMetadata(
      'config-variable:type',
      'array',
      target.constructor,
      propertyKey,
    );
  };

const toMeterDriverArray = (value: string | undefined) => {
  if (typeof value === 'string') {
    const rawMeterDrivers = value.split(',').map((driver) => driver.trim());
    const isInvalid = rawMeterDrivers.some(
      (driver) => !Object.values(MeterDriver).includes(driver as MeterDriver),
    );

    if (!isInvalid) {
      return rawMeterDrivers;
    }
  }

  return undefined;
};
