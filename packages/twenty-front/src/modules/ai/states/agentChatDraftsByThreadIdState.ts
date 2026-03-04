import { atomWithStorage } from 'jotai/utils';

export const AGENT_CHAT_NEW_THREAD_DRAFT_KEY = '__new__';

const DRAFTS_STORAGE_KEY = 'ai/agentChatDraftsByThreadIdState';

const draftsAtom = atomWithStorage<Record<string, string>>(
  DRAFTS_STORAGE_KEY,
  {},
  undefined,
  { getOnInit: true },
);

draftsAtom.debugLabel = DRAFTS_STORAGE_KEY;

export const agentChatDraftsByThreadIdState = {
  type: 'State' as const,
  key: DRAFTS_STORAGE_KEY,
  atom: draftsAtom,
};
