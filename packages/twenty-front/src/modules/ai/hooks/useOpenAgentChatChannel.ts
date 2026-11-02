import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
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
  const { resetRecordSelection } = useResetRecordSelection(
    AI_CHAT_INBOX_INSTANCE_ID,
  );

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
      resetRecordSelection();
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
    [navigate, resetRecordSelection, store],
  );

  return { openAgentChatChannel };
};
