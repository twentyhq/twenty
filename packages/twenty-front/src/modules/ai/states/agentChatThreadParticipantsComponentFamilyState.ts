import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { type AgentChatThreadParticipant } from '~/generated-metadata/graphql';

export const agentChatThreadParticipantsComponentFamilyState =
  createAtomComponentFamilyState<
    AgentChatThreadParticipant[],
    { threadId: string | null }
  >({
    key: 'agentChatThreadParticipantsComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
