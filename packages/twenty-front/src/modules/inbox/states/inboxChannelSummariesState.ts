import { type InboxChannelSummary } from '@/inbox/types/InboxChannelSummary';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Counted by the server, as the client only loads some of a channel's chats
export const inboxChannelSummariesState = createAtomState<
  Record<string, InboxChannelSummary>
>({
  key: 'inboxChannelSummariesState',
  defaultValue: {},
});
