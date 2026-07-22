import { resolveTriggerRetryLimit } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/resolve-trigger-retry-limit.util';

describe('resolveTriggerRetryLimit', () => {
  it('returns the declared value when valid', () => {
    expect(
      resolveTriggerRetryLimit({
        declaredRetryLimit: 5,
        defaultRetryLimit: 3,
      }),
    ).toBe(5);
  });

  it('allows disabling retries with 0', () => {
    expect(
      resolveTriggerRetryLimit({
        declaredRetryLimit: 0,
        defaultRetryLimit: 3,
      }),
    ).toBe(0);
  });

  it('falls back to the default when undeclared', () => {
    expect(
      resolveTriggerRetryLimit({
        declaredRetryLimit: undefined,
        defaultRetryLimit: 10,
      }),
    ).toBe(10);
  });

  it.each([[-1], [1.5], [NaN]])(
    'falls back to the default on invalid value %p',
    (declaredRetryLimit) => {
      expect(
        resolveTriggerRetryLimit({
          declaredRetryLimit,
          defaultRetryLimit: 3,
        }),
      ).toBe(3);
    },
  );

  it('caps the declared value at 10', () => {
    expect(
      resolveTriggerRetryLimit({
        declaredRetryLimit: 99,
        defaultRetryLimit: 3,
      }),
    ).toBe(10);
  });
});
