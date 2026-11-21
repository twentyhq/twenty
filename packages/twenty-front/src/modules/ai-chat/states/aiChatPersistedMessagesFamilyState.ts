import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatPersistedMessagesFamilyState = createAtomFamilyState<
  { messages: ExtendedUIMessage[]; queuedMessages: ExtendedUIMessage[] },
  { threadId: string | null }
>({
  key: 'aiChatPersistedMessagesFamilyState',
  defaultValue: { messages: [], queuedMessages: [] },
});
