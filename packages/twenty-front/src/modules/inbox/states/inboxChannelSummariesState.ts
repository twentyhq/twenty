import { type InboxChannelSummary } from '@/inbox/types/InboxChannelSummary';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxChannelSummariesState = createAtomState<
  Record<string, InboxChannelSummary>
>({
  key: 'inboxChannelSummariesState',
  defaultValue: {},
});
