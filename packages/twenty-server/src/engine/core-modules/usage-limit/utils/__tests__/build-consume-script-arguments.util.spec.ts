import { buildConsumeScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-consume-script-arguments.util';

describe('buildConsumeScriptArguments', () => {
  it.each([1.5, Number.MAX_SAFE_INTEGER + 1, Number.NaN])(
    'refuses the amount %s',
    (amount) => {
      expect(() =>
        buildConsumeScriptArguments([{ amount, warm: null }]),
      ).toThrow(/not a safe integer/);
    },
  );

  it.each([
    { value: -1, pxMs: 60_000 },
    { value: 0.5, pxMs: 60_000 },
    { value: 10, pxMs: 0 },
    { value: 10, pxMs: -1 },
    { value: 10, pxMs: 1.5 },
  ])('refuses the warm value $value with PX $pxMs', (warm) => {
    expect(() => buildConsumeScriptArguments([{ amount: 1, warm }])).toThrow(
      /not a non-negative safe integer/,
    );
  });
});
