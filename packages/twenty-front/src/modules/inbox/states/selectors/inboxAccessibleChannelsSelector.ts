import { inboxChannelsState } from '@/inbox/states/inboxChannelsState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type InboxChannel } from '@/inbox/types/InboxChannel';

export const inboxAccessibleChannelsSelector = createAtomSelector<
  InboxChannel[]
>({
  key: 'inboxAccessibleChannelsSelector',
  get: ({ get }) =>
    (get(inboxChannelsState) ?? []).filter(({ isAccessible }) => isAccessible),
});
