import { computeLogicFunctionExecutionCreditsMicro } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/compute-logic-function-execution-credits-micro.util';

describe('computeLogicFunctionExecutionCreditsMicro', () => {
  it('charges the flat invocation fee plus duration', () => {
    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 1_000,
        isBillingExempt: false,
      }),
    ).toEqual({ invocationCreditsMicro: 100, durationCreditsMicro: 10 });
  });

  it('rounds duration credits up to the next micro credit', () => {
    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 1,
        isBillingExempt: false,
      }),
    ).toEqual({ invocationCreditsMicro: 100, durationCreditsMicro: 1 });

    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 150,
        isBillingExempt: false,
      }),
    ).toEqual({ invocationCreditsMicro: 100, durationCreditsMicro: 2 });
  });

  it('charges no duration credits for a zero or negative duration', () => {
    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 0,
        isBillingExempt: false,
      }),
    ).toEqual({ invocationCreditsMicro: 100, durationCreditsMicro: 0 });

    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: -5,
        isBillingExempt: false,
      }),
    ).toEqual({ invocationCreditsMicro: 100, durationCreditsMicro: 0 });
  });

  it('bills the full timeout duration of a timed out execution', () => {
    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 900_000,
        isBillingExempt: false,
      }),
    ).toEqual({ invocationCreditsMicro: 100, durationCreditsMicro: 9_000 });
  });

  it('charges nothing for billing-exempt applications', () => {
    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 5_000,
        isBillingExempt: true,
      }),
    ).toEqual({ invocationCreditsMicro: 0, durationCreditsMicro: 0 });
  });
});
