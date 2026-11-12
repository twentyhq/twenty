import { isDefined } from 'twenty-shared/utils';

import {
  type AgentChatInboxTabThreadList,
  agentChatInboxTabThreadListState,
} from '@/ai/states/agentChatInboxTabThreadListState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatShownInboxTabThreadListSelector =
  createAtomSelector<AgentChatInboxTabThreadList | null>({
    key: 'agentChatShownInboxTabThreadListSelector',
    get: ({ get }) => {
      const inboxTabThreadList = get(agentChatInboxTabThreadListState);

      return !isDefined(get(agentChatShownChannelViewSelector)) &&
        inboxTabThreadList?.filterStatus ===
          get(agentChatThreadFilterStatusState)
        ? inboxTabThreadList
        : null;
    },
  });
