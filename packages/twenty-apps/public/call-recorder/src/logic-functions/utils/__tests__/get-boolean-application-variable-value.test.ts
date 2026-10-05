import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getBooleanApplicationVariableValue } from 'src/logic-functions/utils/get-boolean-application-variable-value.util';

const BOOLEAN_APPLICATION_VARIABLE_NAME = 'TEST_BOOLEAN_APPLICATION_VARIABLE';

describe('getBooleanApplicationVariableValue', () => {
  beforeEach(() => {
    delete process.env[BOOLEAN_APPLICATION_VARIABLE_NAME];
  });

  afterEach(() => {
    delete process.env[BOOLEAN_APPLICATION_VARIABLE_NAME];
  });

  it('returns the default when unset', () => {
    expect(
      getBooleanApplicationVariableValue({
        applicationVariableName: BOOLEAN_APPLICATION_VARIABLE_NAME,
        defaultValue: true,
      }),
    ).toBe(true);
  });

  it.each(['', '   '])('returns the default for an empty value', (value) => {
    process.env[BOOLEAN_APPLICATION_VARIABLE_NAME] = value;

    expect(
      getBooleanApplicationVariableValue({
        applicationVariableName: BOOLEAN_APPLICATION_VARIABLE_NAME,
        defaultValue: false,
      }),
    ).toBe(false);
  });

  it.each(['  TrUe  ', '1', 'yes', 'on'])('returns true for %s', (value) => {
    process.env[BOOLEAN_APPLICATION_VARIABLE_NAME] = value;

    expect(
      getBooleanApplicationVariableValue({
        applicationVariableName: BOOLEAN_APPLICATION_VARIABLE_NAME,
        defaultValue: false,
      }),
    ).toBe(true);
  });

  it.each(['  FaLsE  ', '0', 'no', 'off'])('returns false for %s', (value) => {
    process.env[BOOLEAN_APPLICATION_VARIABLE_NAME] = value;

    expect(
      getBooleanApplicationVariableValue({
        applicationVariableName: BOOLEAN_APPLICATION_VARIABLE_NAME,
        defaultValue: true,
      }),
    ).toBe(false);
  });

  it.each([true, false])(
    'returns the %s default for an unrecognized value',
    (defaultValue) => {
      process.env[BOOLEAN_APPLICATION_VARIABLE_NAME] = 'maybe';

      expect(
        getBooleanApplicationVariableValue({
          applicationVariableName: BOOLEAN_APPLICATION_VARIABLE_NAME,
          defaultValue,
        }),
      ).toBe(defaultValue);
    },
  );
});
