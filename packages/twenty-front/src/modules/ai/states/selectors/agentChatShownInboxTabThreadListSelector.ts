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
      if (isDefined(get(agentChatShownChannelViewSelector))) {
        return null;
      }

      const inboxTabThreadList = get(agentChatInboxTabThreadListState);

      if (
        inboxTabThreadList?.filterStatus !==
        get(agentChatThreadFilterStatusState)
      ) {
        return null;
      }

      return inboxTabThreadList;
    },
  });
