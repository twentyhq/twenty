import { buildLogicFunctionJobMaxRate } from 'src/engine/core-modules/logic-function/utils/build-logic-function-job-max-rate.util';

describe('buildLogicFunctionJobMaxRate', () => {
  it('keys the maxRate of a logic function by its id', () => {
    expect(
      buildLogicFunctionJobMaxRate({
        logicFunctionId: 'logic-function-id',
        maxRate: { max: 10, durationMs: 1_000 },
      }),
    ).toEqual({
      key: 'logicFunction:logic-function-id',
      max: 10,
      durationMs: 1_000,
    });
  });

  it('leaves a logic function without maxRate unpaced', () => {
    expect(
      buildLogicFunctionJobMaxRate({
        logicFunctionId: 'logic-function-id',
        maxRate: null,
      }),
    ).toBeUndefined();
  });
});
