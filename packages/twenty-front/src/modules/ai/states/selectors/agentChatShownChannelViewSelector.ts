import { isDefined } from 'twenty-shared/utils';

import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatShownChannelViewSelector =
  createAtomSelector<AgentChatChannelView | null>({
    key: 'agentChatShownChannelViewSelector',
    get: ({ get }) => {
      const channelView = get(agentChatChannelViewState);
      const channels = get(agentChatChannelsState);

      if (
        !isDefined(channelView) ||
        (isDefined(channels) &&
          !channels.some(
            ({ id, isAccessible }) =>
              isAccessible && id === channelView.channelId,
          ))
      ) {
        return null;
      }

      return channelView;
    },
  });
