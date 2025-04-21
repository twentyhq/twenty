import { Transform } from 'class-transformer';

import { MeterDriver } from 'src/engine/core-modules/metrics/types/meter-driver.type';

export const CastToMeterDriverArray = () =>
  Transform(({ value }: { value: string }) => toMeterDriverArray(value));

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
