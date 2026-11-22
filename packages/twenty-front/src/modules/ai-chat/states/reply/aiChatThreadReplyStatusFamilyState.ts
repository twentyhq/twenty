import { type AiChatReplyStatus } from '@/ai-chat/types/AiChatReplyStatus';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatThreadReplyStatusFamilyState = createAtomFamilyState<
  AiChatReplyStatus,
  { threadId: string | null }
>({
  key: 'aiChatThreadReplyStatusFamilyState',
  defaultValue: 'idle',
});
