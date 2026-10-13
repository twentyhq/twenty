import { APPLICATION_REGISTRATION_METRIC_ERROR_CATEGORIES } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-error-category.type';
import { toApplicationRegistrationMetricErrorCategory } from 'src/engine/core-modules/application/application-registration-analytics/utils/to-application-registration-metric-error-category.util';

describe('toApplicationRegistrationMetricErrorCategory', () => {
  it('should map the server-produced error types to their category', () => {
    expect(toApplicationRegistrationMetricErrorCategory('TimeoutError')).toBe(
      'TIMEOUT',
    );
    expect(
      toApplicationRegistrationMetricErrorCategory('Runtime.OutOfMemory'),
    ).toBe('OUT_OF_MEMORY');
    expect(
      toApplicationRegistrationMetricErrorCategory('Runtime.ImportModuleError'),
    ).toBe('RUNTIME');
  });

  it('should map a missing error type to UNKNOWN', () => {
    expect(toApplicationRegistrationMetricErrorCategory(undefined)).toBe(
      'UNKNOWN',
    );
    expect(toApplicationRegistrationMetricErrorCategory('')).toBe('UNKNOWN');
  });

  it('should never echo an error name the function code chose', () => {
    const dataBearingErrorName = 'jane@apple.dev';

    const category =
      toApplicationRegistrationMetricErrorCategory(dataBearingErrorName);

    expect(category).toBe('THROWN');
    expect(APPLICATION_REGISTRATION_METRIC_ERROR_CATEGORIES).toContain(
      category,
    );
    expect(category).not.toContain(dataBearingErrorName);
  });

  it('should treat ordinary runtime errors thrown by the function as THROWN', () => {
    expect(toApplicationRegistrationMetricErrorCategory('TypeError')).toBe(
      'THROWN',
    );
    expect(toApplicationRegistrationMetricErrorCategory('UnhandledError')).toBe(
      'THROWN',
    );
  });
});
