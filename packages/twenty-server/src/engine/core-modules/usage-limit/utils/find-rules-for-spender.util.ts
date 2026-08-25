import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

// A rule naming the spender and a rule left open to every spender of that type
// produce two different buckets, so both apply rather than the narrower one
// replacing the shared one.
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
      rule.operationType === operationType &&
      (rule.spenderId === '' || rule.spenderId === spender.spenderId),
  );
