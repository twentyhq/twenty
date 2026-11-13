import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { type InboxChannelView } from '@/inbox/types/InboxChannelView';
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
