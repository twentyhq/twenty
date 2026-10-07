import { buildCounterScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-counter-script-arguments.util';

describe('buildCounterScriptArguments', () => {
  it('encodes amounts, seeds and PX values as three positional arrays', () => {
    expect(
      buildCounterScriptArguments([
        { amount: 300, seed: { value: 600, pxMs: 60_000 } },
        { amount: 0, seed: null },
        { amount: -5, seed: { value: 0, pxMs: 1 } },
      ]),
    ).toEqual(['[300,0,-5]', '[600,false,0]', '[60000,false,1]']);
  });

  it('encodes an absent seed as false, never null', () => {
    const [, seeds, pxs] = buildCounterScriptArguments([
      { amount: 1, seed: null },
    ]);

    expect(seeds).toBe('[false]');
    expect(pxs).toBe('[false]');
  });

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
