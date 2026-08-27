import { isDefined } from 'twenty-shared/utils';

import { SPENDER_TYPE_SPECIFICITY } from 'src/engine/core-modules/usage-limit/constants/spender-type-specificity.constant';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type QuotaCounterRequest } from 'src/engine/core-modules/usage-limit/types/quota-counter-request.type';
import { type UsageLimitDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-definition.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage-limit/types/usage-spenders.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { findRulesForSpender } from 'src/engine/core-modules/usage-limit/utils/find-rules-for-spender.util';
import { computeQuotaLimitValue } from 'src/engine/core-modules/usage-limit/utils/compute-quota-limit-value.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

// Narrowest scope first, so the first exhausted counter names the scope the
// caller ran out of.
const counterSpecificity = (counter: QuotaCounterRequest): number =>
  SPENDER_TYPE_SPECIFICITY[counter.spenderType] * 4 +
  (isDefined(counter.spenderId) ? 0 : 2) +
  (counter.operationType === '' ? 1 : 0);

export const buildQuotaCounters = ({
  definition,
  rules,
  workspaceId,
  resourceType,
  operationType,
  spenders,
  allowance,
  periodStart,
}: {
  definition: UsageLimitDefinition;
  rules: FlatUsageLimit[];
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
  allowance: number | null;
  periodStart: Date;
}): QuotaCounterRequest[] => {
  const allowedSpenders = buildSpendersFromUsageSpenders(spenders).filter(
    (spender) => definition.allowedSpenderTypes.includes(spender.spenderType),
  );

  const ruleCounters = allowedSpenders.flatMap((spender) =>
    findRulesForSpender({ rules, spender, operationType, limitKind: 'quota' })
      .map((rule) => {
        const limitValue = computeQuotaLimitValue({ rule, allowance });

        if (!isDefined(limitValue)) {
          return null;
        }

        const spenderId = rule.spenderId === '' ? null : rule.spenderId;

        return {
          key: buildQuotaCounterKey({
            workspaceId,
            resourceType,
            operationType: rule.operationType,
            spenderType: spender.spenderType,
            spenderId,
            periodStart,
          }),
          limitValue,
          resourceType,
          operationType: rule.operationType,
          spenderType: spender.spenderType,
          spenderId,
          meter: definition.meters,
          isFallback: false,
        } satisfies QuotaCounterRequest;
      })
      .filter(isDefined),
  );

  // The allowance is the credit pool: it spans every resource and operation,
  // and a narrower rule tightens it rather than replacing it.
  const fallbackCounters = definition.fallbacks.flatMap((fallback) => {
    if (fallback.source !== 'allowance' || !isDefined(allowance)) {
      return [];
    }

    if (
      !allowedSpenders.some(
        (spender) => spender.spenderType === fallback.spenderType,
      )
    ) {
      return [];
    }

    return [
      {
        key: buildQuotaCounterKey({
          workspaceId,
          resourceType: '',
          operationType: '',
          spenderType: fallback.spenderType,
          spenderId: null,
          periodStart,
        }),
        limitValue: allowance,
        resourceType: '',
        operationType: '',
        spenderType: fallback.spenderType,
        spenderId: null,
        meter: 'creditsUsedMicro',
        isFallback: true,
      } satisfies QuotaCounterRequest,
    ];
  });

  return [...ruleCounters, ...fallbackCounters].sort(
    (a, b) => counterSpecificity(a) - counterSpecificity(b),
  );
};
