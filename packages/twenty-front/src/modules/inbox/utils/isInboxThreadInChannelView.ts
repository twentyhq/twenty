import { isDefined } from 'twenty-shared/utils';

import { type InboxChannelView } from '@/inbox/types/InboxChannelView';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { getInboxThreadChannelStatus } from '@/inbox/utils/getInboxThreadChannelStatus';
import { isInboxThreadInChannelThreadFilter } from '@/inbox/utils/isInboxThreadInChannelThreadFilter';
import { AgentChatChannelAssignmentFilter } from '~/generated-metadata/graphql';

export const isInboxThreadInChannelView = ({
  thread,
  channelView,
  currentWorkspaceMemberId,
  isMentioned,
}: {
  thread: Pick<
    AiChatThreadRecord,
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
