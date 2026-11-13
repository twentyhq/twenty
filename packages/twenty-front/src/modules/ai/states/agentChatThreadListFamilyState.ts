import { type AgentChatThreadList } from '@/ai/types/AgentChatThreadList';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatThreadListFamilyState = createAtomFamilyState<
  AgentChatThreadList | null,
  string
>({
  key: 'agentChatThreadListFamilyState',
  defaultValue: null,
});
