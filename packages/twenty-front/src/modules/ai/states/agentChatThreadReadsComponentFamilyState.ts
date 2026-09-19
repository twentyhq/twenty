import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { type AgentChatThreadRead } from '~/generated-metadata/graphql';

export const agentChatThreadReadsComponentFamilyState =
  createAtomComponentFamilyState<
    AgentChatThreadRead[],
    { threadId: string | null }
  >({
    key: 'agentChatThreadReadsComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
