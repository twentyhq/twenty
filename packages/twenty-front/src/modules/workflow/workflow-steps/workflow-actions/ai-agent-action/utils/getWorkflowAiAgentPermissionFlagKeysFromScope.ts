import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER } from '@/marketplace/constants/PermissionFlagTypeByUniversalIdentifier';

export const getWorkflowAiAgentPermissionFlagKeysFromScope = (
  scope: AiRunScope | undefined,
): string[] =>
  (scope?.permissionFlagUniversalIdentifiers ?? [])
    .map((universalIdentifier) =>
      PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER.get(universalIdentifier),
    )
    .filter(isDefined);
