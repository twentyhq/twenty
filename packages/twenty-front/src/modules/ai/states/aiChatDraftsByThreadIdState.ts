import { isAiChatDraftsByThreadId } from '@/ai/utils/isAiChatDraftsByThreadId';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

const DRAFTS_STORAGE_KEY = 'ai/agentChatDraftsByThreadIdState';

export const aiChatDraftsByThreadIdState = createAtomState<
  Record<string, string>
>({
  key: DRAFTS_STORAGE_KEY,
  defaultValue: {},
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: isAiChatDraftsByThreadId,
});
