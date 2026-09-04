import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const findLimitsForSpender = ({
  limits,
  spender,
  operationType,
}: {
  limits: FlatUsageLimit[];
  spender: Spender;
  operationType: UsageOperationType;
}): FlatUsageLimit[] =>
  limits.filter(
    (limit) =>
      limit.spenderType === spender.spenderType &&
      (limit.operationType === UsageOperationType.ALL ||
        limit.operationType === operationType) &&
      (limit.spenderId === '' || limit.spenderId === spender.spenderId),
  );
