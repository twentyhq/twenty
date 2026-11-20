import { isNonEmptyArray } from 'twenty-shared/utils';
import { Transform } from 'class-transformer';

import { MeterDriver } from 'src/engine/core-modules/metrics/types/meter-driver.type';
import { toTrimmedStringArray } from 'src/engine/core-modules/twenty-config/utils/to-trimmed-string-array.util';

export const CastToMeterDriverArray = () =>
  Transform(({ value }: { value: unknown }) => toMeterDriverArray(value));

const toMeterDriverArray = (value: unknown) => {
  const rawMeterDrivers = toTrimmedStringArray(value);

  if (!isNonEmptyArray(rawMeterDrivers)) {
    return undefined;
  }

  const isInvalid = rawMeterDrivers.some(
    (driver) => !Object.values(MeterDriver).includes(driver as MeterDriver),
  );

  return isInvalid ? undefined : rawMeterDrivers;
};
