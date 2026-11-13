import { inboxSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { type InboxChannelView } from '@/ai/types/AgentChatChannelView';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const inboxSelectedChannelViewSelector =
  createAtomSelector<InboxChannelView | null>({
    key: 'inboxSelectedChannelViewSelector',
    get: ({ get }) => {
      const inboxSelectedThreadListSource = get(
        inboxSelectedThreadListSourceState,
      );

      return inboxSelectedThreadListSource.type === 'channel'
        ? inboxSelectedThreadListSource.channelView
        : null;
    },
  });
