import { shouldHideDeprecatedVariable } from '~/pages/settings/applications/utils/shouldHideDeprecatedVariable';

describe('shouldHideDeprecatedVariable', () => {
  it('should hide a deprecated variable with no value', () => {
    expect(
      shouldHideDeprecatedVariable({ isDeprecated: true, hasValue: false }),
    ).toBe(true);
  });

  it('should keep a deprecated variable that still has a value', () => {
    expect(
      shouldHideDeprecatedVariable({ isDeprecated: true, hasValue: true }),
    ).toBe(false);
  });

  it('should keep a variable that is not deprecated', () => {
    expect(
      shouldHideDeprecatedVariable({ isDeprecated: false, hasValue: false }),
    ).toBe(false);
  });

  it('should keep a variable whose deprecation flag is absent', () => {
    expect(
      shouldHideDeprecatedVariable({ isDeprecated: null, hasValue: false }),
    ).toBe(false);
    expect(shouldHideDeprecatedVariable({ hasValue: false })).toBe(false);
  });
});
