import { useQuery } from '@apollo/client/react';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  GetAgentChatOpenThreadsSummaryDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const EMPTY_AGENT_CHAT_OPEN_THREADS_SUMMARY = {
  openThreadCount: 0,
  needsInputThreadCount: 0,
  hasUnreadOpenThread: false,
  hasUnreadMentionThread: false,
  hasUnreadAssignedThread: false,
};

// Counted by the server over every chat, past the pages loaded here; it is
// read again wherever the member's inbox state changes
export const useAgentChatOpenThreadsSummary = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { data } = useQuery(GetAgentChatOpenThreadsSummaryDocument, {
    skip: !hasAiPermission || !isAiChatInboxEnabled,
    fetchPolicy: 'cache-and-network',
  });

  return (
    data?.agentChatOpenThreadsSummary ?? EMPTY_AGENT_CHAT_OPEN_THREADS_SUMMARY
  );
};
