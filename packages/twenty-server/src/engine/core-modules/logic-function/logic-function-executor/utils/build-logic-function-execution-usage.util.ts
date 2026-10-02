import { computeLogicFunctionExecutionCreditsMicro } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/compute-logic-function-execution-credits-micro.util';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

export const buildLogicFunctionExecutionUsage = ({
  durationMs,
  isBillingExempt,
  resourceId,
  spenders,
}: {
  durationMs: number;
  isBillingExempt: boolean;
  resourceId: string;
  spenders: UsageSpenders;
}): { usageEvents: RecordUsageInput[]; cost: QuotaCost } => {
  const { invocationCreditsMicro, durationCreditsMicro, billedDurationMs } =
    computeLogicFunctionExecutionCreditsMicro({ durationMs, isBillingExempt });

  const usageEvents: RecordUsageInput[] = [
    {
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      operationType: UsageOperationType.CODE_EXECUTION,
      creditsUsedMicro: invocationCreditsMicro,
      quantity: 1,
      unit: UsageUnit.INVOCATION,
      resourceId,
      spenders,
    },
    {
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      operationType: UsageOperationType.CODE_EXECUTION,
      creditsUsedMicro: durationCreditsMicro,
      quantity: billedDurationMs,
      unit: UsageUnit.MILLISECOND,
      resourceId,
      spenders,
    },
  ];

  return {
    usageEvents,
    cost: {
      [UsageUnit.CREDIT]: invocationCreditsMicro + durationCreditsMicro,
      [UsageUnit.INVOCATION]: 1,
    },
  };
};
