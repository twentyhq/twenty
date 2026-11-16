import { buildLogicFunctionJobLimiter } from 'src/engine/core-modules/logic-function/utils/build-logic-function-job-limiter.util';

describe('buildLogicFunctionJobLimiter', () => {
  it('keys the limiter of a logic function by its id', () => {
    expect(
      buildLogicFunctionJobLimiter({
        logicFunctionId: 'logic-function-id',
        limiter: { max: 10, durationMs: 1_000 },
      }),
    ).toEqual({
      key: 'logicFunction:logic-function-id',
      max: 10,
      durationMs: 1_000,
    });
  });

  it('leaves a logic function without limiter unpaced', () => {
    expect(
      buildLogicFunctionJobLimiter({
        logicFunctionId: 'logic-function-id',
        limiter: null,
      }),
    ).toBeUndefined();
  });
});
