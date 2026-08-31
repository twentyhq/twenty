import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const findRulesForSpender = ({
  rules,
  spender,
  operationType,
}: {
  rules: FlatUsageLimit[];
  spender: Spender;
  operationType: UsageOperationType;
}): FlatUsageLimit[] =>
  rules.filter(
    (rule) =>
      rule.spenderType === spender.spenderType &&
      (rule.operationType === UsageOperationType.ALL ||
        rule.operationType === operationType) &&
      (rule.spenderId === '' || rule.spenderId === spender.spenderId),
  );
