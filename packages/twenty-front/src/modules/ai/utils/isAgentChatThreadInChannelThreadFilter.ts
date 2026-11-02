import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { AgentChatChannelThreadFilter } from '~/generated-metadata/graphql';

export const isAgentChatThreadInChannelThreadFilter = ({
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
