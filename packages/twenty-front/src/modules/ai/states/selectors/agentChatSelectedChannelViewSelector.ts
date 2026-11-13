import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatSelectedChannelViewSelector =
  createAtomSelector<AgentChatChannelView | null>({
    key: 'agentChatSelectedChannelViewSelector',
    get: ({ get }) => {
      const agentChatSelectedThreadListSource = get(
        agentChatSelectedThreadListSourceState,
      );

      return agentChatSelectedThreadListSource.type === 'channel'
        ? agentChatSelectedThreadListSource.channelView
        : null;
    },
  });
