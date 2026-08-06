import { shouldDisplayVariable } from '~/pages/settings/applications/utils/shouldDisplayVariable';

describe('shouldDisplayVariable', () => {
  it('should hide a deprecated variable with no value', () => {
    expect(shouldDisplayVariable({ isDeprecated: true, hasValue: false })).toBe(
      false,
    );
  });

  it('should display a deprecated variable that still has a value', () => {
    expect(shouldDisplayVariable({ isDeprecated: true, hasValue: true })).toBe(
      true,
    );
  });

  it('should display a variable that is not deprecated whether or not it has a value', () => {
    expect(
      shouldDisplayVariable({ isDeprecated: false, hasValue: false }),
    ).toBe(true);
    expect(shouldDisplayVariable({ isDeprecated: false, hasValue: true })).toBe(
      true,
    );
  });
});
