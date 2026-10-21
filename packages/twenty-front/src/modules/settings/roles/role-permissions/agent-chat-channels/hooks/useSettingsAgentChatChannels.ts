import { useQuery } from '@apollo/client/react';

import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  GetAgentChatChannelsDocument,
} from '~/generated-metadata/graphql';

export const useSettingsAgentChatChannels = () => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { data } = useQuery(GetAgentChatChannelsDocument, {
    fetchPolicy: 'cache-and-network',
    skip: !isAiChatInboxEnabled,
  });

  return data?.agentChatChannels ?? [];
};
