import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';

export const findRuleForSpender = ({
  rules,
  spender,
  operationType,
}: {
  rules: FlatUsageLimit[];
  spender: Spender;
  operationType: UsageOperationType;
}): FlatUsageLimit | undefined => {
  const forSpenderType = rules.filter(
    (rule) =>
      rule.spenderType === spender.spenderType &&
      rule.operationType === operationType,
  );

  return (
    forSpenderType.find(
      (rule) => rule.spenderId !== '' && rule.spenderId === spender.spenderId,
    ) ?? forSpenderType.find((rule) => rule.spenderId === '')
  );
};
