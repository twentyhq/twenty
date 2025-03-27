import { Transform } from 'class-transformer';

import { MeterDriver } from 'src/instrument';

export const CastToMeterDriverArray = () =>
  Transform(({ value }: { value: string }) => toMeterDriverArray(value));

const toMeterDriverArray = (value: any) => {
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
