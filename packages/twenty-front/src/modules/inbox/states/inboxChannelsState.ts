import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type InboxChannel } from '@/inbox/types/InboxChannel';

export const inboxChannelsState = createAtomState<InboxChannel[] | null>({
  key: 'inboxChannelsState',
  defaultValue: null,
});
