import { PermissionFlagType } from 'twenty-shared/constants';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useCanReadCoreAgentRuns = () => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const canManageAi = useHasPermissionFlag(PermissionFlagType.AI_SETTINGS);

  return isAiChatInboxEnabled && canManageAi;
};
