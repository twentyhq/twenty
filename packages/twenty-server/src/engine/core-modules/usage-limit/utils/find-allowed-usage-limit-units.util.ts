import { LIMIT_KIND_RULES } from 'src/engine/core-modules/usage-limit/constants/limit-kind-rules.constant';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type UsageLimitOperationDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-operation-definition.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export const findAllowedUsageLimitUnits = ({
  limitKind,
  definition,
  operationType,
}: {
  limitKind: LimitKind;
  definition: { allowedOperations: UsageLimitOperationDefinition[] };
  operationType: UsageOperationType;
}): UsageUnit[] => {
  if (
    operationType === UsageOperationType.ALL &&
    LIMIT_KIND_RULES[limitKind].isAllOperationTypeAllowed
  ) {
    return [UsageUnit.CREDIT];
  }

  return (
    definition.allowedOperations.find(
      (allowedOperation) => allowedOperation.operationType === operationType,
    )?.allowedUnits ?? []
  );
};
