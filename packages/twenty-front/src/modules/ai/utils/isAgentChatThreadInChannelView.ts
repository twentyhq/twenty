import { isDefined } from 'twenty-shared/utils';

import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadChannelStatus } from '@/ai/utils/getAgentChatThreadChannelStatus';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
} from '~/generated-metadata/graphql';

const isAgentChatThreadInChannelThreadFilter = ({
  thread,
  filter,
  isMentioned,
}: {
  thread: Pick<AgentChatThreadRecord, 'pendingQuestionMessageId'>;
  filter: AgentChatChannelThreadFilter;
  isMentioned: boolean;
}): boolean => {
  switch (filter) {
    case AgentChatChannelThreadFilter.ANY:
      return true;
    case AgentChatChannelThreadFilter.NEEDS_INPUT:
      return isDefined(thread.pendingQuestionMessageId);
    case AgentChatChannelThreadFilter.MENTIONED:
      return isMentioned;
  }
};

export const isAgentChatThreadInChannelView = ({
  thread,
  channelView,
  currentWorkspaceMemberId,
  isMentioned,
}: {
  thread: Pick<
    AgentChatThreadRecord,
    | 'deletedAt'
    | 'channelId'
    | 'assigneeId'
    | 'lastActivityAt'
    | 'channelArchivedAt'
    | 'channelSnoozedUntil'
    | 'pendingQuestionMessageId'
  >;
  channelView: AgentChatChannelView;
  currentWorkspaceMemberId: string | undefined;
  isMentioned: boolean;
}): boolean => {
  if (
    isDefined(thread.deletedAt) ||
    thread.channelId !== channelView.channelId ||
    getAgentChatThreadChannelStatus(thread) !== channelView.channelStatus ||
    !isAgentChatThreadInChannelThreadFilter({
      thread,
      filter: channelView.filter,
      isMentioned,
    })
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
