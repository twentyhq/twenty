import { isBookCallQualified } from 'src/engine/core-modules/onboarding/utils/is-book-call-qualified.util';

describe('isBookCallQualified', () => {
  it('should qualify a company at or above the threshold', () => {
    expect(
      isBookCallQualified({ minEmployeeCount: 50, employeeCount: 50 }),
    ).toBe(true);
  });

  it('should not qualify a company below the threshold', () => {
    expect(
      isBookCallQualified({ minEmployeeCount: 50, employeeCount: 49 }),
    ).toBe(false);
  });

  it('should not qualify a company without a known employee count', () => {
    expect(
      isBookCallQualified({ minEmployeeCount: 50, employeeCount: null }),
    ).toBe(false);
  });

  it('should not qualify anyone when the step is disabled', () => {
    expect(
      isBookCallQualified({ minEmployeeCount: null, employeeCount: 500 }),
    ).toBe(false);
  });
});
