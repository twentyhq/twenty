import { isDefined } from 'twenty-shared/utils';

import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadChannelStatus } from '@/ai/utils/getAgentChatThreadChannelStatus';
import { AgentChatChannelAssignmentFilter } from '~/generated-metadata/graphql';

export const isAgentChatThreadInChannelView = ({
  thread,
  channelView,
  currentWorkspaceMemberId,
}: {
  thread: AgentChatThreadRecord;
  channelView: AgentChatChannelView;
  currentWorkspaceMemberId: string | undefined;
}): boolean => {
  if (
    isDefined(thread.deletedAt) ||
    thread.channelId !== channelView.channelId ||
    getAgentChatThreadChannelStatus(thread) !== channelView.channelStatus
  ) {
    return false;
  }

  switch (channelView.assignment) {
    case AgentChatChannelAssignmentFilter.ANY:
      return true;
    case AgentChatChannelAssignmentFilter.UNASSIGNED:
      return !isDefined(thread.assigneeId);
    case AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME:
      return (
        isDefined(currentWorkspaceMemberId) &&
        thread.assigneeId === currentWorkspaceMemberId
      );
  }
};
