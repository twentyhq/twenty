import { type FunctionConfiguration } from '@aws-sdk/client-lambda';

export const isToolFunctionConfigurationUpToDate = ({
  configuration,
  memorySize,
  timeoutSeconds,
  ephemeralStorageMb,
}: {
  configuration: FunctionConfiguration | undefined;
  memorySize: number;
  timeoutSeconds: number;
  ephemeralStorageMb: number;
}): boolean =>
  configuration?.MemorySize === memorySize &&
  configuration?.Timeout === timeoutSeconds &&
  configuration?.EphemeralStorage?.Size === ephemeralStorageMb;
