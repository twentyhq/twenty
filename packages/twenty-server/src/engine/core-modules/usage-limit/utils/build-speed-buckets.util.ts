import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { SPENDER_TYPE_SPECIFICITY } from 'src/engine/core-modules/usage-limit/constants/spender-type-specificity.constant';
import { type DefaultUsageLimitFallback } from 'src/engine/core-modules/usage-limit/types/default-usage-limit-fallback.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type SpeedBucketRequest } from 'src/engine/core-modules/usage-limit/types/speed-bucket-request.type';
import { buildFallbackSpeedBucket } from 'src/engine/core-modules/usage-limit/utils/build-fallback-speed-bucket.util';
import { buildSpeedBucketKey } from 'src/engine/core-modules/usage-limit/utils/build-speed-bucket-key.util';
import { buildSpendersFromAuthContext } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-auth-context.util';
import { findRulesForSpender } from 'src/engine/core-modules/usage-limit/utils/find-rules-for-spender.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const bucketSpecificity = (bucket: SpeedBucketRequest): number =>
  SPENDER_TYPE_SPECIFICITY[bucket.spenderType] * 2 +
  (isDefined(bucket.spenderId) ? 0 : 1);

export const buildSpeedBuckets = ({
  defaultUsageLimitFallbacks,
  rules,
  authContext,
  resourceType,
  operationType,
}: {
  defaultUsageLimitFallbacks: DefaultUsageLimitFallback[];
  rules: FlatUsageLimit[];
  authContext: WorkspaceAuthContext;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
}): SpeedBucketRequest[] => {
  const spenders = buildSpendersFromAuthContext(authContext);

  const buckets = spenders.flatMap((spender) => {
    const spenderRules = findRulesForSpender({ rules, spender, operationType });

    const ruleBuckets = spenderRules.map((rule) => ({
      key: buildSpeedBucketKey({
        counterScope: 'perWorkspace',
        workspaceId: authContext.workspace.id,
        resourceType,
        operationType,
        spenderType: spender.spenderType,
        spenderId: rule.spenderId,
        windowSeconds: rule.windowSeconds,
      }),
      burst: rule.burstValue ?? rule.limitValue,
      refillPerWindow: rule.limitValue,
      windowMs: rule.windowSeconds * 1000,
      spenderType: spender.spenderType,
      spenderId: rule.spenderId === '' ? null : rule.spenderId,
      isFallback: false,
    }));

    const hasRuleForEverySpender = spenderRules.some(
      (rule) => rule.spenderId === '',
    );

    const fallbackBuckets = defaultUsageLimitFallbacks
      .filter(
        (fallback) =>
          fallback.spenderType === spender.spenderType &&
          !(fallback.isOverridable && hasRuleForEverySpender),
      )
      .map((fallback) =>
        buildFallbackSpeedBucket({
          fallback,
          spender,
          authContext,
          resourceType,
          operationType,
        }),
      )
      .filter(isDefined);

    return [...ruleBuckets, ...fallbackBuckets];
  });

  return buckets.sort((a, b) => bucketSpecificity(a) - bucketSpecificity(b));
};
