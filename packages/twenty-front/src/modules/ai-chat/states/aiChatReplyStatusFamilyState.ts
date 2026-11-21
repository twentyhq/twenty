import { type AiChatReplyStatus } from '@/ai-chat/types/AiChatReplyStatus';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatReplyStatusFamilyState = createAtomFamilyState<
  AiChatReplyStatus,
  { threadId: string | null }
>({
  key: 'aiChatReplyStatusFamilyState',
  defaultValue: 'idle',
});
