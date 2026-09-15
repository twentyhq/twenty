import { computeLogicFunctionExecutionCreditsMicro } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/compute-logic-function-execution-credits-micro.util';

describe('computeLogicFunctionExecutionCreditsMicro', () => {
  it('charges the flat invocation fee plus duration', () => {
    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 1_000,
        isBillingExempt: false,
      }),
    ).toEqual({
      invocationCreditsMicro: 100,
      durationCreditsMicro: 100,
      billedDurationMs: 1_000,
    });
  });

  it('rounds duration credits down to the previous micro credit', () => {
    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 9,
        isBillingExempt: false,
      }),
    ).toEqual({
      invocationCreditsMicro: 100,
      durationCreditsMicro: 0,
      billedDurationMs: 9,
    });

    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 155,
        isBillingExempt: false,
      }),
    ).toEqual({
      invocationCreditsMicro: 100,
      durationCreditsMicro: 15,
      billedDurationMs: 155,
    });
  });

  it('charges no duration credits for a zero or negative duration', () => {
    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 0,
        isBillingExempt: false,
      }),
    ).toEqual({
      invocationCreditsMicro: 100,
      durationCreditsMicro: 0,
      billedDurationMs: 0,
    });

    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: -5,
        isBillingExempt: false,
      }),
    ).toEqual({
      invocationCreditsMicro: 100,
      durationCreditsMicro: 0,
      billedDurationMs: 0,
    });
  });

  it('bills the full timeout duration of a timed out execution', () => {
    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 900_000,
        isBillingExempt: false,
      }),
    ).toEqual({
      invocationCreditsMicro: 100,
      durationCreditsMicro: 90_000,
      billedDurationMs: 900_000,
    });
  });

  it('charges nothing for billing-exempt applications', () => {
    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 5_000,
        isBillingExempt: true,
      }),
    ).toEqual({
      invocationCreditsMicro: 0,
      durationCreditsMicro: 0,
      billedDurationMs: 0,
    });
  });
});
