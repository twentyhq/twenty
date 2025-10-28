import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';

describe('detectTimeZone', () => {
  it('should return the system timezone', () => {
    const result = detectTimeZone();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return UTC when Intl.DateTimeFormat throws error', () => {
    const originalDateTimeFormat = global.Intl.DateTimeFormat;
    // @ts-expect-error - Mocking for test
    global.Intl.DateTimeFormat = jest.fn().mockImplementation(() => {
      throw new Error('DateTimeFormat not supported');
    });

    expect(detectTimeZone()).toBe('UTC');
    global.Intl.DateTimeFormat = originalDateTimeFormat;
  });

  it('should return UTC when resolvedOptions throws error', () => {
    const originalDateTimeFormat = global.Intl.DateTimeFormat;
    // @ts-expect-error - Mocking for test
    global.Intl.DateTimeFormat = jest.fn().mockImplementation(() => ({
      resolvedOptions: () => {
        throw new Error('resolvedOptions failed');
      },
    }));

    expect(detectTimeZone()).toBe('UTC');
    global.Intl.DateTimeFormat = originalDateTimeFormat;
  });

  it('should return specific timezone when mocked', () => {
    const originalDateTimeFormat = global.Intl.DateTimeFormat;
    // @ts-expect-error - Mocking for test
    global.Intl.DateTimeFormat = jest.fn().mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' }),
    }));

    expect(detectTimeZone()).toBe('America/New_York');
    global.Intl.DateTimeFormat = originalDateTimeFormat;
  });
});
