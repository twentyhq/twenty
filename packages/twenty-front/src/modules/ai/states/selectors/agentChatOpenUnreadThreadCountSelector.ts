import {
  getAgentChatThreadInboxScope,
  isAgentChatThreadUnread,
  isDefined,
} from 'twenty-shared/utils';

import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { buildAgentChatThreadInboxState } from '@/ai/utils/buildAgentChatThreadInboxState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatOpenUnreadThreadCountSelector =
  createAtomSelector<number>({
    key: 'agentChatOpenUnreadThreadCountSelector',
    get: ({ get }) => {
      if (!get(hasLoadedAgentChatThreadParticipantsState)) {
        return 0;
      }

      const participants = get(agentChatThreadParticipantsState);
      const now = new Date(get(agentChatThreadInboxNowState));

      return get(agentChatThreadsSelector).filter((thread) => {
        const inboxState = buildAgentChatThreadInboxState(
          thread,
          participants[thread.id],
        );

        return (
          !isDefined(thread.deletedAt) &&
          getAgentChatThreadInboxScope(inboxState, now) === 'INBOX' &&
          isAgentChatThreadUnread(inboxState)
        );
      }).length;
    },
  });
