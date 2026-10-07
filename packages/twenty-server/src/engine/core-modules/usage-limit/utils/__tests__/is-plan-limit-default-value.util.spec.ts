import { isPlanLimitDefaultValue } from 'src/engine/core-modules/usage-limit/utils/is-plan-limit-default-value.util';

describe('isPlanLimitDefaultValue', () => {
  it.each([0, 1, 1_000_000, null])('accepts %p', (value) => {
    expect(isPlanLimitDefaultValue(value)).toBe(true);
  });

  it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1, '100', undefined, {}])(
    'rejects %p',
    (value) => {
      expect(isPlanLimitDefaultValue(value)).toBe(false);
    },
  );
});
