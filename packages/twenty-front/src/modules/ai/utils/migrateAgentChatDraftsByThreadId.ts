import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { type AgentChatDraft } from '@/ai/types/AgentChatDraft';

// Drafts used to be stored as their serialized document alone; keep a
// member's unsent text when the draft grew a pending record.
export const migrateAgentChatDraftsByThreadId = (
  value: unknown,
): Record<string, AgentChatDraft> | undefined => {
  if (!isPlainObject(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value).map(([draftKey, draft]) => [
      draftKey,
      isString(draft) ? { serializedDocument: draft } : draft,
    ]),
  ) as Record<string, AgentChatDraft>;
};
