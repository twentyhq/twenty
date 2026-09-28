import { type FlatStockLimit } from 'src/engine/core-modules/usage-limit/types/flat-stock-limit.type';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { findLimitsForSpender } from 'src/engine/core-modules/usage-limit/utils/find-limits-for-spender.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

export const findStockLimitsForSpenders = ({
  limits,
  usageSpenders,
  operationType,
}: {
  limits: FlatStockLimit[];
  usageSpenders: UsageSpenders;
  operationType: UsageOperationType;
}): FlatStockLimit[] => {
  const matched = buildSpendersFromUsageSpenders(usageSpenders).flatMap(
    (spender) => findLimitsForSpender({ limits, spender, operationType }),
  );

  return [...new Map(matched.map((limit) => [limit.id, limit])).values()];
};
