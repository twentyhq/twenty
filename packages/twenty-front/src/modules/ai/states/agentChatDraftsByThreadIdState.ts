import { isAgentChatDraftsByThreadId } from '@/ai/utils/isAgentChatDraftsByThreadId';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const AGENT_CHAT_NEW_THREAD_DRAFT_KEY = '__new__';

const DRAFTS_STORAGE_KEY = 'ai/agentChatDraftsByThreadIdState';

export const agentChatDraftsByThreadIdState = createAtomState<
  Record<string, string>
>({
  key: DRAFTS_STORAGE_KEY,
  defaultValue: {},
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: isAgentChatDraftsByThreadId,
});
