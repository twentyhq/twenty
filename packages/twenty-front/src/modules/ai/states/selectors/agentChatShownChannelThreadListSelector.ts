import { isDefined } from 'twenty-shared/utils';

import {
  type AgentChatChannelThreadList,
  agentChatChannelThreadListState,
} from '@/ai/states/agentChatChannelThreadListState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatShownChannelThreadListSelector =
  createAtomSelector<AgentChatChannelThreadList | null>({
    key: 'agentChatShownChannelThreadListSelector',
    get: ({ get }) => {
      const channelView = get(agentChatShownChannelViewSelector);
      const channelThreadList = get(agentChatChannelThreadListState);

      return isDefined(channelView) &&
        channelThreadList?.viewKey === getAgentChatChannelViewKey(channelView)
        ? channelThreadList
        : null;
    },
  });
