import { useQuery } from '@apollo/client/react';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  GetAgentChatChannelsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useSettingsAgentChatChannels = () => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const canManageChannels = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );
  const { data } = useQuery(GetAgentChatChannelsDocument, {
    fetchPolicy: 'cache-and-network',
    skip: !isAiChatInboxEnabled || !canManageChannels,
  });

  return data?.agentChatChannels ?? [];
};
