import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// A thread the member marked unread while it was on screen stays unread until
// they leave it, instead of being read again by the open view
export const agentChatThreadKeptUnreadIdState = createAtomState<string | null>({
  key: 'ai/agentChatThreadKeptUnreadIdState',
  defaultValue: null,
});
