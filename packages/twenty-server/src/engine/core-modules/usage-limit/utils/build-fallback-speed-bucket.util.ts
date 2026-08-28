import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type DefaultUsageLimitFallback } from 'src/engine/core-modules/usage-limit/types/default-usage-limit-fallback.type';
import { type SpeedBucketRequest } from 'src/engine/core-modules/usage-limit/types/speed-bucket-request.type';
import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';
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
  fallback: DefaultUsageLimitFallback;
  spender: Spender;
  authContext: WorkspaceAuthContext;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
}): SpeedBucketRequest | null => {
  const isCrossWorkspace = fallback.counterScope === 'crossWorkspace';
  const universalIdentifier = getApplicationUniversalIdentifier(authContext);

  if (isCrossWorkspace && !isDefined(universalIdentifier)) {
    return null;
  }

  const spenderId = isCrossWorkspace ? universalIdentifier : null;

  return {
    key: buildSpeedBucketKey({
      counterScope: fallback.counterScope,
      workspaceId: authContext.workspace.id,
      resourceType,
      operationType,
      spenderType: spender.spenderType,
      spenderId,
      windowSeconds: Math.ceil(fallback.windowMs / 1000),
    }),
    burst: fallback.maxTokens,
    refillPerWindow: fallback.maxTokens,
    windowMs: fallback.windowMs,
    spenderType: spender.spenderType,
    spenderId,
    isFallback: true,
  };
};
