import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type SpeedLimitDefault } from 'src/engine/core-modules/usage-limit/types/speed-limit-default.type';
import { type SpeedBucketRequest } from 'src/engine/core-modules/usage-limit/types/speed-bucket-request.type';
import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';
import { buildSpeedBucketKey } from 'src/engine/core-modules/usage-limit/utils/build-speed-bucket-key.util';
import { getApplicationUniversalIdentifier } from 'src/engine/core-modules/usage-limit/utils/get-application-universal-identifier.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const buildDefaultSpeedBucket = ({
  speedLimitDefault,
  spender,
  authContext,
  resourceType,
  operationType,
}: {
  speedLimitDefault: SpeedLimitDefault;
  spender: Spender;
  authContext: WorkspaceAuthContext;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
}): SpeedBucketRequest | null => {
  const isCrossWorkspace = speedLimitDefault.counterScope === 'crossWorkspace';
  const isIdentifiedAcrossWorkspaces = spender.spenderType === 'application';
  const universalIdentifier = getApplicationUniversalIdentifier(authContext);

  if (
    isCrossWorkspace &&
    isIdentifiedAcrossWorkspaces &&
    !isDefined(universalIdentifier)
  ) {
    return null;
  }

  const spenderId =
    isCrossWorkspace && isIdentifiedAcrossWorkspaces
      ? universalIdentifier
      : null;

  return {
    key: buildSpeedBucketKey({
      counterScope: speedLimitDefault.counterScope,
      workspaceId: authContext.workspace.id,
      resourceType,
      operationType,
      spenderType: spender.spenderType,
      spenderId,
      windowSeconds: Math.ceil(speedLimitDefault.windowMs / 1000),
    }),
    burst: speedLimitDefault.maxTokens,
    refillPerWindow: speedLimitDefault.maxTokens,
    windowMs: speedLimitDefault.windowMs,
    spenderType: spender.spenderType,
    spenderId,
    isDefault: true,
  };
};
