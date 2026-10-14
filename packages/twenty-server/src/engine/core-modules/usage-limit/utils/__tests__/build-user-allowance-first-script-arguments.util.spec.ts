import { buildUserAllowanceFirstScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-user-allowance-first-script-arguments.util';

describe('buildUserAllowanceFirstScriptArguments', () => {
  it('encodes the split arguments, then one warm value and TTL per key', () => {
    expect(
      buildUserAllowanceFirstScriptArguments({
        amount: 300,
        userAllowanceLimit: 1_000,
        isFallbackEnabled: true,
        warms: [{ value: 900, ttl: 60_000 }, null],
      }),
    ).toEqual([
      JSON.stringify({
        amount: 300,
        userAllowanceLimit: 1_000,
        isFallbackEnabled: true,
      }),
      JSON.stringify([900, false]),
      JSON.stringify([60_000, false]),
    ]);
  });

  it('refuses a negative amount', () => {
    expect(() =>
      buildUserAllowanceFirstScriptArguments({
        amount: -1,
        userAllowanceLimit: 1_000,
        isFallbackEnabled: true,
        warms: [null],
      }),
    ).toThrow(
      /^User-allowance-first amount .* is not a non-negative safe integer$/,
    );
  });

  it('refuses a negative user allowance limit', () => {
    expect(() =>
      buildUserAllowanceFirstScriptArguments({
        amount: 100,
        userAllowanceLimit: -1,
        isFallbackEnabled: true,
        warms: [null],
      }),
    ).toThrow(
      /^User-allowance-first limit .* is not a non-negative safe integer$/,
    );
  });

  it.each([
    { value: -1, ttl: 60_000 },
    { value: 10, ttl: 0 },
    { value: 10, ttl: 1.5 },
  ])('refuses the warm value $value with TTL $ttl', (warm) => {
    expect(() =>
      buildUserAllowanceFirstScriptArguments({
        amount: 100,
        userAllowanceLimit: 1_000,
        isFallbackEnabled: true,
        warms: [null, warm],
      }),
    ).toThrow(
      /^User-allowance-first warm value .* is not a non-negative safe integer with a positive safe TTL$/,
    );
  });
});
