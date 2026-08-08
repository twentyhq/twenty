import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Tracks the /chat/:threadId param value the chat page URL sync effect has
// already reacted to, so it can tell URL-driven changes (deep link, browser
// back/forward) apart from thread-state-driven ones.
export const aiChatPageLastHandledThreadIdParamState = createAtomState<
  string | null
>({
  key: 'ai/aiChatPageLastHandledThreadIdParamState',
  defaultValue: null,
});
