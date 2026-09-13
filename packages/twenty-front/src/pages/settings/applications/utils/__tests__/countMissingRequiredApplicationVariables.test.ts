import { countMissingRequiredApplicationVariables } from '~/pages/settings/applications/utils/countMissingRequiredApplicationVariables';

describe('countMissingRequiredApplicationVariables', () => {
  it('counts the required variables that are still empty', () => {
    expect(
      countMissingRequiredApplicationVariables([
        { value: '', isRequired: true, isDeprecated: false },
        { value: 'set', isRequired: true, isDeprecated: false },
        { value: '', isRequired: false, isDeprecated: false },
      ]),
    ).toBe(1);
  });

  it('does not count a deprecated variable, even when required and empty', () => {
    expect(
      countMissingRequiredApplicationVariables([
        { value: '', isRequired: true, isDeprecated: true },
      ]),
    ).toBe(0);
  });

  it('returns zero when nothing is required', () => {
    expect(
      countMissingRequiredApplicationVariables([
        { value: '', isRequired: false, isDeprecated: false },
      ]),
    ).toBe(0);
  });
});
