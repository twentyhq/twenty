import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ResolvedUsageLimitFallback } from 'src/engine/core-modules/usage-limit/types/resolved-usage-limit-fallback.type';
import { type SpeedBucketRequest } from 'src/engine/core-modules/usage-limit/types/speed-bucket-request.type';
import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';
import { buildServerSpeedBucketKey } from 'src/engine/core-modules/usage-limit/utils/build-server-speed-bucket-key.util';
import { buildSpeedBucketKey } from 'src/engine/core-modules/usage-limit/utils/build-speed-bucket-key.util';
import { getApplicationUniversalIdentifier } from 'src/engine/core-modules/usage-limit/utils/get-application-universal-identifier.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const buildFallbackSpeedBucket = ({
  fallback,
  spender,
  authContext,
  resourceType,
  operationType,
}: {
  fallback: ResolvedUsageLimitFallback;
  spender: Spender;
  authContext: WorkspaceAuthContext;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
}): SpeedBucketRequest | null => {
  const windowSeconds = Math.ceil(fallback.windowMs / 1000);

  if (fallback.counterScope === 'crossWorkspace') {
    const universalIdentifier = getApplicationUniversalIdentifier(authContext);

    if (!isDefined(universalIdentifier)) {
      return null;
    }

    return {
      key: buildServerSpeedBucketKey({
        resourceType,
        operationType,
        spenderType: spender.spenderType,
        spenderId: universalIdentifier,
        windowSeconds,
      }),
      burst: fallback.maxTokens,
      refillPerWindow: fallback.maxTokens,
      windowMs: fallback.windowMs,
      spenderType: spender.spenderType,
      spenderId: universalIdentifier,
    };
  }

  // One counter for every spender of the type, matching the single
  // workspace-wide bucket the throttler this replaces kept.
  return {
    key: buildSpeedBucketKey({
      workspaceId: authContext.workspace.id,
      resourceType,
      operationType,
      spenderType: spender.spenderType,
      spenderId: null,
      windowSeconds,
    }),
    burst: fallback.maxTokens,
    refillPerWindow: fallback.maxTokens,
    windowMs: fallback.windowMs,
    spenderType: spender.spenderType,
    spenderId: null,
  };
};
