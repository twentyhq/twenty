import { isDefined } from 'twenty-shared/utils';

import { type InboxChannelView } from '@/ai/types/AgentChatChannelView';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getInboxThreadChannelStatus } from '@/ai/utils/getAgentChatThreadChannelStatus';
import { isInboxThreadInChannelThreadFilter } from '@/ai/utils/isAgentChatThreadInChannelThreadFilter';
import { AgentChatChannelAssignmentFilter } from '~/generated-metadata/graphql';

export const isInboxThreadInChannelView = ({
  thread,
  channelView,
  currentWorkspaceMemberId,
  isMentioned,
}: {
  thread: Pick<
    InboxThreadRecord,
    | 'deletedAt'
    | 'channelId'
    | 'assigneeId'
    | 'lastActivityAt'
    | 'channelArchivedAt'
    | 'channelSnoozedUntil'
    | 'pendingQuestionMessageId'
  >;
  channelView: InboxChannelView;
  currentWorkspaceMemberId: string | undefined;
  isMentioned: boolean;
}): boolean => {
  if (
    isDefined(thread.deletedAt) ||
    thread.channelId !== channelView.channelId ||
    getInboxThreadChannelStatus(thread) !== channelView.channelStatus ||
    !isInboxThreadInChannelThreadFilter({
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
    case AgentChatChannelAssignmentFilter.ASSIGNED:
      return isDefined(thread.assigneeId);
    case AgentChatChannelAssignmentFilter.UNASSIGNED:
      return !isDefined(thread.assigneeId);
    case AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME:
      return (
        isDefined(currentWorkspaceMemberId) &&
        thread.assigneeId === currentWorkspaceMemberId
      );
  }
};
