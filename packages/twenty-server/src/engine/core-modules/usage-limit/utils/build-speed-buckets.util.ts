import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { SPENDER_TYPE_SPECIFICITY } from 'src/engine/core-modules/usage-limit/constants/spender-type-specificity.constant';
import { type SpeedLimitDefault } from 'src/engine/core-modules/usage-limit/types/speed-limit-default.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type SpeedBucketRequest } from 'src/engine/core-modules/usage-limit/types/speed-bucket-request.type';
import { buildDefaultSpeedBucket } from 'src/engine/core-modules/usage-limit/utils/build-default-speed-bucket.util';
import { buildSpeedBucketKey } from 'src/engine/core-modules/usage-limit/utils/build-speed-bucket-key.util';
import { buildSpendersFromAuthContext } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-auth-context.util';
import { findLimitsForSpender } from 'src/engine/core-modules/usage-limit/utils/find-limits-for-spender.util';
import { normalizeSpenderId } from 'src/engine/core-modules/usage-limit/utils/normalize-spender-id.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const bucketSpecificity = (bucket: SpeedBucketRequest): number =>
  SPENDER_TYPE_SPECIFICITY[bucket.spenderType] * 2 +
  (isDefined(bucket.spenderId) ? 0 : 1);

export const buildSpeedBuckets = ({
  speedLimitDefaults,
  limits,
  authContext,
  resourceType,
  operationType,
}: {
  speedLimitDefaults: SpeedLimitDefault[];
  limits: FlatUsageLimit[];
  authContext: WorkspaceAuthContext;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
}): SpeedBucketRequest[] => {
  const spenders = buildSpendersFromAuthContext(authContext);

  const buckets = spenders.flatMap((spender) => {
    const spenderLimits = findLimitsForSpender({
      limits,
      spender,
      operationType,
    }).filter((limit) => limit.limitKind === 'speed');

    const limitBuckets = spenderLimits.map((limit) => ({
      key: buildSpeedBucketKey({
        counterScope: 'perWorkspace',
        workspaceId: authContext.workspace.id,
        resourceType,
        operationType: limit.operationType,
        spenderType: spender.spenderType,
        spenderId: limit.spenderId,
        windowSeconds: limit.periodCount,
      }),
      burst: limit.burstValue ?? limit.limitValue,
      refillPerWindow: limit.limitValue,
      windowMs: limit.periodCount * 1000,
      spenderType: spender.spenderType,
      spenderId: normalizeSpenderId(limit.spenderId),
      isDefault: false,
    }));

    const hasLimitForEverySpender = spenderLimits.some(
      (limit) => limit.spenderId === '',
    );

    const defaultBuckets = speedLimitDefaults
      .filter(
        (speedLimitDefault) =>
          speedLimitDefault.spenderType === spender.spenderType &&
          !(speedLimitDefault.isOverridable && hasLimitForEverySpender),
      )
      .map((speedLimitDefault) =>
        buildDefaultSpeedBucket({
          speedLimitDefault,
          spender,
          authContext,
          resourceType,
          operationType,
        }),
      )
      .filter(isDefined);

    return [...limitBuckets, ...defaultBuckets];
  });

  return buckets.sort((a, b) => bucketSpecificity(a) - bucketSpecificity(b));
};
