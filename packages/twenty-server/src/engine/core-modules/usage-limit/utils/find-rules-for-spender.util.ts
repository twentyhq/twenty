import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const findRulesForSpender = ({
  rules,
  spender,
  operationType,
}: {
  rules: FlatUsageLimit[];
  spender: Spender;
  operationType: UsageOperationType;
}): FlatUsageLimit[] => {
  const forSpenderType = rules.filter(
    (rule) =>
      rule.spenderType === spender.spenderType &&
      rule.operationType === operationType,
  );

  const forThisSpender = forSpenderType.filter(
    (rule) => rule.spenderId !== '' && rule.spenderId === spender.spenderId,
  );

  return forThisSpender.length > 0
    ? forThisSpender
    : forSpenderType.filter((rule) => rule.spenderId === '');
};
