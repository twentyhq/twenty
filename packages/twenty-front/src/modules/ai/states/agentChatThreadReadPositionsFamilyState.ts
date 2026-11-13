import { type AgentChatThreadReadPosition } from '@/ai/types/AgentChatThreadReadPosition';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatThreadReadPositionsFamilyState = createAtomFamilyState<
  AgentChatThreadReadPosition[] | null,
  { threadId: string | null }
>({
  key: 'agentChatThreadReadPositionsFamilyState',
  defaultValue: null,
});
