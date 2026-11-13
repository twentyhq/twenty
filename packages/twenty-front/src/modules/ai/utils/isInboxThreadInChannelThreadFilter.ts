import { isDefined } from 'twenty-shared/utils';

import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { AgentChatChannelThreadFilter } from '~/generated-metadata/graphql';

export const isInboxThreadInChannelThreadFilter = ({
  thread,
  filter,
  isMentioned,
}: {
  thread: Pick<InboxThreadRecord, 'pendingQuestionMessageId'>;
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
