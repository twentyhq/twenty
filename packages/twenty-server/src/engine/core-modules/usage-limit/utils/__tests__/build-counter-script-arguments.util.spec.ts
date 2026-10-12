import { buildCounterScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-counter-script-arguments.util';

describe('buildCounterScriptArguments', () => {
  it.each([1.5, Number.MAX_SAFE_INTEGER + 1, Number.NaN])(
    'refuses the amount %s',
    (amount) => {
      expect(() =>
        buildCounterScriptArguments([{ amount, seed: null }]),
      ).toThrow(/not a safe integer/);
    },
  );

  it.each([
    { value: -1, pxMs: 60_000 },
    { value: 0.5, pxMs: 60_000 },
    { value: 10, pxMs: 0 },
    { value: 10, pxMs: -1 },
    { value: 10, pxMs: 1.5 },
  ])('refuses the seed $value with PX $pxMs', (seed) => {
    expect(() => buildCounterScriptArguments([{ amount: 1, seed }])).toThrow(
      /not a non-negative safe integer/,
    );
  });
});
