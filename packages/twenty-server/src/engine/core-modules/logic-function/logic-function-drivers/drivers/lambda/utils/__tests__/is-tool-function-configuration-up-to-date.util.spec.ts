import { isToolFunctionConfigurationUpToDate } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/is-tool-function-configuration-up-to-date.util';

const DESIRED = {
  memorySize: 4096,
  timeoutSeconds: 300,
  ephemeralStorageMb: 4096,
};

const MATCHING_CONFIGURATION = {
  MemorySize: 4096,
  Timeout: 300,
  EphemeralStorage: { Size: 4096 },
};

describe('isToolFunctionConfigurationUpToDate', () => {
  it('should return true when memory, timeout and ephemeral storage all match', () => {
    expect(
      isToolFunctionConfigurationUpToDate({
        configuration: MATCHING_CONFIGURATION,
        ...DESIRED,
      }),
    ).toBe(true);
  });

  it('should return false when the memory drifted', () => {
    expect(
      isToolFunctionConfigurationUpToDate({
        configuration: { ...MATCHING_CONFIGURATION, MemorySize: 1024 },
        ...DESIRED,
      }),
    ).toBe(false);
  });

  it('should return false when the timeout drifted', () => {
    expect(
      isToolFunctionConfigurationUpToDate({
        configuration: { ...MATCHING_CONFIGURATION, Timeout: 60 },
        ...DESIRED,
      }),
    ).toBe(false);
  });

  it('should return false when the ephemeral storage drifted', () => {
    expect(
      isToolFunctionConfigurationUpToDate({
        configuration: {
          ...MATCHING_CONFIGURATION,
          EphemeralStorage: { Size: 512 },
        },
        ...DESIRED,
      }),
    ).toBe(false);
  });

  it('should return false when the configuration is missing', () => {
    expect(
      isToolFunctionConfigurationUpToDate({
        configuration: undefined,
        ...DESIRED,
      }),
    ).toBe(false);
  });
});
