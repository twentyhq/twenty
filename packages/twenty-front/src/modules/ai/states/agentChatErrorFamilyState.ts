import { type AiChatError } from '@/ai/types/AiChatError';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatErrorFamilyState = createAtomFamilyState<
  AiChatError | null,
  { threadId: string | null }
>({
  key: 'agentChatErrorFamilyState',
  defaultValue: null,
});
