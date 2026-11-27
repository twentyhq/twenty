import { type AiChatError } from '@/ai-chat/types/AiChatError';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatThreadReplyErrorFamilyState = createAtomFamilyState<
  AiChatError | null,
  { threadId: string | null }
>({
  key: 'aiChatThreadReplyErrorFamilyState',
  defaultValue: null,
});
