import { isNonEmptyString } from '@sniptt/guards';
import { Transform } from 'class-transformer';

import { MeterDriver } from 'src/engine/core-modules/metrics/types/meter-driver.type';

export const CastToMeterDriverArray = () =>
  Transform(({ value }: { value: string }) => toMeterDriverArray(value));

const toMeterDriverArray = (value: string | undefined) => {
  if (isNonEmptyString(value)) {
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
