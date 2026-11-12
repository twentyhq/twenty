import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatShownChannelViewSelector =
  createAtomSelector<AgentChatChannelView | null>({
    key: 'agentChatShownChannelViewSelector',
    get: ({ get }) => {
      const agentChatSelectedThreadListSource = get(
        agentChatSelectedThreadListSourceState,
      );

      return agentChatSelectedThreadListSource.type === 'channel'
        ? agentChatSelectedThreadListSource.channelView
        : null;
    },
  });
