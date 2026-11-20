import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// The thread's messages as last fetched, which replace the shown ones once no reply is in flight
export const aiChatPersistedMessagesFamilyState = createAtomFamilyState<
  { messages: ExtendedUIMessage[]; queuedMessages: ExtendedUIMessage[] },
  { threadId: string | null }
>({
  key: 'aiChatPersistedMessagesFamilyState',
  defaultValue: { messages: [], queuedMessages: [] },
});
