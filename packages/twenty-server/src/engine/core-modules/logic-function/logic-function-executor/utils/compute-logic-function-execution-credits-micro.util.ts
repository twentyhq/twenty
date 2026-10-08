import {
  LOGIC_FUNCTION_DURATION_CREDITS_MICRO_PER_MS,
  LOGIC_FUNCTION_INVOCATION_CREDITS_MICRO,
} from 'src/engine/core-modules/logic-function/logic-function-executor/constants/logic-function-billing.constant';

export const computeLogicFunctionExecutionCreditsMicro = ({
  durationMs,
  isBillingExempt,
}: {
  durationMs: number;
  isBillingExempt: boolean;
}): {
  invocationCreditsMicro: number;
  durationCreditsMicro: number;
  billedDurationMs: number;
} => {
  if (isBillingExempt) {
    return {
      invocationCreditsMicro: 0,
      durationCreditsMicro: 0,
      billedDurationMs: 0,
    };
  }

  const billedDurationMs = Math.max(Math.floor(durationMs), 0);

  return {
    invocationCreditsMicro: LOGIC_FUNCTION_INVOCATION_CREDITS_MICRO,
    durationCreditsMicro: Math.floor(
      billedDurationMs * LOGIC_FUNCTION_DURATION_CREDITS_MICRO_PER_MS,
    ),
    billedDurationMs,
  };
};
