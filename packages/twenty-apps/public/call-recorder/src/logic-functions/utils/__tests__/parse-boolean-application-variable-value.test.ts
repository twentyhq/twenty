import { describe, expect, it } from 'vitest';

import { parseBooleanApplicationVariableValue } from 'src/logic-functions/utils/parse-boolean-application-variable-value.util';

describe('parseBooleanApplicationVariableValue', () => {
  it.each([undefined, '', '   '])(
    'returns the default for a missing value (%j)',
    (rawValue) => {
      expect(
        parseBooleanApplicationVariableValue({ rawValue, defaultValue: true }),
      ).toBe(true);
      expect(
        parseBooleanApplicationVariableValue({ rawValue, defaultValue: false }),
      ).toBe(false);
    },
  );

  it.each(['true', ' TRUE ', '1', 'yes', 'on'])(
    'returns true for %j',
    (rawValue) => {
      expect(
        parseBooleanApplicationVariableValue({ rawValue, defaultValue: false }),
      ).toBe(true);
    },
  );

  it.each(['false', ' False ', '0', 'no', 'off'])(
    'returns false for %j',
    (rawValue) => {
      expect(
        parseBooleanApplicationVariableValue({ rawValue, defaultValue: true }),
      ).toBe(false);
    },
  );

  it('returns the default for an unrecognized value', () => {
    expect(
      parseBooleanApplicationVariableValue({
        rawValue: 'maybe',
        defaultValue: false,
      }),
    ).toBe(false);
  });
});
