import { isString } from '@sniptt/guards';
import { isValidUuid } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

const NEW_AI_CHAT_THREAD_ID_STORAGE_KEY = 'ai/newAiChatThreadIdState';

// Stored per tab so two tabs never start the same chat, and stored before the
// first keystroke so a reload finds the draft typed under it
const readOrStoreNewAiChatThreadId = (): string => {
  try {
    const storedThreadId: unknown = JSON.parse(
      sessionStorage.getItem(NEW_AI_CHAT_THREAD_ID_STORAGE_KEY) ?? 'null',
    );

    if (isString(storedThreadId) && isValidUuid(storedThreadId)) {
      return storedThreadId;
    }

    const threadId = v4();

    sessionStorage.setItem(
      NEW_AI_CHAT_THREAD_ID_STORAGE_KEY,
      JSON.stringify(threadId),
    );

    return threadId;
  } catch {
    return v4();
  }
};

// The server creates the new chat's thread on its first message, and a fresh
// id replaces this one once that message is sent
export const newAiChatThreadIdState = createAtomState<string>({
  key: NEW_AI_CHAT_THREAD_ID_STORAGE_KEY,
  defaultValue: readOrStoreNewAiChatThreadId(),
  useSessionStorage: true,
});
