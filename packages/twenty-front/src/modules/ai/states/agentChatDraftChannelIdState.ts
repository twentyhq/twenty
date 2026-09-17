import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Channel the next draft thread is created in, set when a new chat is
// started from a channel page and consumed by the thread creation.
export const agentChatDraftChannelIdState = createAtomState<string | null>({
  key: 'agentChatDraftChannelIdState',
  defaultValue: null,
});
