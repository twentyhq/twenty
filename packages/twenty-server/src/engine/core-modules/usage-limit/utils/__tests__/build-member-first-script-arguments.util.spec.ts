import { buildMemberFirstScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-member-first-script-arguments.util';

describe('buildMemberFirstScriptArguments', () => {
  it('encodes the split arguments, then one warm value and TTL per key', () => {
    expect(
      buildMemberFirstScriptArguments({
        amount: 300,
        memberLimit: 1_000,
        isFallbackEnabled: true,
        warms: [{ value: 900, ttl: 60_000 }, null],
      }),
    ).toEqual([
      JSON.stringify({
        amount: 300,
        memberLimit: 1_000,
        isFallbackEnabled: true,
      }),
      JSON.stringify([900, false]),
      JSON.stringify([60_000, false]),
    ]);
  });

  it('refuses a negative amount', () => {
    expect(() =>
      buildMemberFirstScriptArguments({
        amount: -1,
        memberLimit: 1_000,
        isFallbackEnabled: true,
        warms: [null],
      }),
    ).toThrow(/^Member-first amount .* is not a non-negative safe integer$/);
  });

  it('refuses a negative member limit', () => {
    expect(() =>
      buildMemberFirstScriptArguments({
        amount: 100,
        memberLimit: -1,
        isFallbackEnabled: true,
        warms: [null],
      }),
    ).toThrow(/^Member-first limit .* is not a non-negative safe integer$/);
  });

  it.each([
    { value: -1, ttl: 60_000 },
    { value: 10, ttl: 0 },
    { value: 10, ttl: 1.5 },
  ])('refuses the warm value $value with TTL $ttl', (warm) => {
    expect(() =>
      buildMemberFirstScriptArguments({
        amount: 100,
        memberLimit: 1_000,
        isFallbackEnabled: true,
        warms: [null, warm],
      }),
    ).toThrow(
      /^Member-first warm value .* is not a non-negative safe integer with a positive safe TTL$/,
    );
  });
});
