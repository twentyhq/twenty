import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';

import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

export const useOpenAgentChatChannel = () => {
  const store = useStore();
  const navigate = useNavigateApp();

  const openAgentChatChannel = useCallback(
    (channelId: string) => {
      store.set(agentChatChannelViewState.atom, {
        channelId,
        channelStatus: AgentChatChannelThreadStatus.OPEN,
        assignment: AgentChatChannelAssignmentFilter.ANY,
      });
      navigate(AppPath.AiChatInbox, { threadId: null });
    },
    [navigate, store],
  );

  return { openAgentChatChannel };
};
