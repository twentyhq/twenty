import { type AiChatThreadReadPosition } from '@/ai/types/AgentChatThreadReadPosition';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatThreadReadPositionsFamilyState = createAtomFamilyState<
  AiChatThreadReadPosition[] | null,
  { threadId: string | null }
>({
  key: 'aiChatThreadReadPositionsFamilyState',
  defaultValue: null,
});
