import { isValidUuid } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// The server creates the new chat's thread on its first message, and a fresh
// id replaces this one once that message is sent
export const newAiChatThreadIdState = createAtomState<string>({
  key: 'ai/newAiChatThreadIdState',
  defaultValue: v4(),
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: isValidUuid,
});
