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
}): { invocationCreditsMicro: number; durationCreditsMicro: number } => {
  if (isBillingExempt) {
    return { invocationCreditsMicro: 0, durationCreditsMicro: 0 };
  }

  return {
    invocationCreditsMicro: LOGIC_FUNCTION_INVOCATION_CREDITS_MICRO,
    // Rounded up like AWS bills per started millisecond.
    durationCreditsMicro: Math.ceil(
      Math.max(durationMs, 0) * LOGIC_FUNCTION_DURATION_CREDITS_MICRO_PER_MS,
    ),
  };
};
