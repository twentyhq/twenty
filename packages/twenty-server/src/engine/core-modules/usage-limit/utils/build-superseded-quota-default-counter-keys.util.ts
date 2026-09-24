import { isDefined } from 'twenty-shared/utils';

import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { buildQuotaDefaultCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-default-counter-key.util';
import { buildQuotaDefaultKeyScope } from 'src/engine/core-modules/usage-limit/utils/build-quota-default-key-scope.util';

export const buildSupersededQuotaDefaultCounterKeys = ({
  workspaceId,
  defaultCounters,
  activeValues,
}: {
  workspaceId: string;
  defaultCounters: LimitQuotaCounter[];
  activeValues: (number | undefined)[];
}): string[] =>
  defaultCounters.flatMap((counter, index) => {
    const activeValue = activeValues[index];

    if (!isDefined(activeValue) || activeValue === counter.limitValue) {
      return [];
    }

    return [
      counter.key,
      buildQuotaDefaultCounterKey({
        ...buildQuotaDefaultKeyScope({ workspaceId, counter }),
        limitValue: activeValue,
      }),
    ];
  });
