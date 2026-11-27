import { computeLogicFunctionExecutionCreditsMicro } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/compute-logic-function-execution-credits-micro.util';
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
  operationType = UsageOperationType.CODE_EXECUTION,
}: {
  durationMs: number;
  isBillingExempt: boolean;
  operationType?: UsageOperationType;
  resourceId: string;
  spenders: UsageSpenders;
}): RecordUsageInput[] => {
  const { invocationCreditsMicro, durationCreditsMicro, billedDurationMs } =
    computeLogicFunctionExecutionCreditsMicro({ durationMs, isBillingExempt });

  return [
    {
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      operationType,
      creditsUsedMicro: invocationCreditsMicro,
      quantity: 1,
      unit: UsageUnit.INVOCATION,
      resourceId,
      spenders,
    },
    {
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      operationType,
      creditsUsedMicro: durationCreditsMicro,
      quantity: billedDurationMs,
      unit: UsageUnit.MILLISECOND,
      resourceId,
      spenders,
    },
  ];
};
