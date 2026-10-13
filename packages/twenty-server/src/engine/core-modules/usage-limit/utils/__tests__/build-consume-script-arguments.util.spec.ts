import { buildConsumeScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-consume-script-arguments.util';

describe('buildConsumeScriptArguments', () => {
  it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1, Number.NaN])(
    'refuses the amount %s',
    (amount) => {
      expect(() =>
        buildConsumeScriptArguments([{ amount, warm: null }]),
      ).toThrow(/^Counter amount .* is not a non-negative safe integer$/);
    },
  );

  it.each([
    { value: -1, ttl: 60_000 },
    { value: 0.5, ttl: 60_000 },
    { value: 10, ttl: 0 },
    { value: 10, ttl: -1 },
    { value: 10, ttl: 1.5 },
  ])('refuses the warm value $value with TTL $ttl', (warm) => {
    expect(() => buildConsumeScriptArguments([{ amount: 1, warm }])).toThrow(
      /^Counter warm value .* is not a non-negative safe integer with a positive safe TTL$/,
    );
  });
});
