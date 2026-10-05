import { isDefined } from 'twenty-shared/utils';

import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { normalizeSpenderId } from 'src/engine/core-modules/usage-limit/utils/normalize-spender-id.util';

export const groupSpenderIdsByType = (
  usageLimits: Pick<UsageLimitEntity, 'spenderType' | 'spenderId'>[],
): Map<SpenderType, string[]> => {
  const idsByType = new Map<SpenderType, string[]>();

  for (const usageLimit of usageLimits) {
    const spenderId = normalizeSpenderId(usageLimit.spenderId);

    if (!isDefined(spenderId)) {
      continue;
    }

    idsByType.set(usageLimit.spenderType, [
      ...(idsByType.get(usageLimit.spenderType) ?? []),
      spenderId,
    ]);
  }

  return idsByType;
};
