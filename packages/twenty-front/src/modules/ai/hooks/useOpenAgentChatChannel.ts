import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';
import { isMatchingPathname } from '~/utils/isMatchingPathname';

export const useOpenAgentChatChannel = () => {
  const store = useStore();
  const navigate = useNavigateApp();

  const openAgentChatChannel = useCallback(
    ({
      channelId,
      channelStatus = AgentChatChannelThreadStatus.OPEN,
      assignment = AgentChatChannelAssignmentFilter.ANY,
      filter = AgentChatChannelThreadFilter.ANY,
    }: Pick<AgentChatChannelView, 'channelId'> &
      Partial<
        Pick<AgentChatChannelView, 'channelStatus' | 'assignment' | 'filter'>
      >) => {
      store.set(agentChatChannelViewState.atom, {
        channelId,
        channelStatus,
        assignment,
        filter,
      });
      navigate(AppPath.AiChatInbox, { threadId: null }, undefined, {
        replace: isMatchingPathname(
          window.location.pathname,
          getAppPath(AppPath.AiChatInbox, { threadId: null }),
        ),
      });
    },
    [navigate, store],
  );

  return { openAgentChatChannel };
};
