import { Transform } from 'class-transformer';

import { MeterDriver } from 'src/engine/core-modules/metrics/types/meter-driver.type';

// Backward compatibility mapping for old lowercase values
const LEGACY_METER_DRIVER_MAP: Record<string, MeterDriver> = {
  opentelemetry: MeterDriver.OPEN_TELEMETRY,
  console: MeterDriver.CONSOLE,
  OpenTelemetry: MeterDriver.OPEN_TELEMETRY,
  Console: MeterDriver.CONSOLE,
};

export const CastToMeterDriverArray = () =>
  Transform(({ value }: { value: string }) => toMeterDriverArray(value));

const toMeterDriverArray = (value: string | undefined): MeterDriver[] => {
  if (typeof value !== 'string') {
    return [];
  }

  const rawMeterDrivers = value.split(',').map((driver) => driver.trim());
  const validDrivers = Object.values(MeterDriver) as string[];
  const normalizedDrivers: MeterDriver[] = [];

  for (const driver of rawMeterDrivers) {
    if (validDrivers.includes(driver)) {
      normalizedDrivers.push(driver as MeterDriver);
    } else if (driver in LEGACY_METER_DRIVER_MAP) {
      normalizedDrivers.push(LEGACY_METER_DRIVER_MAP[driver]);
    }
  }

  return normalizedDrivers;
};
