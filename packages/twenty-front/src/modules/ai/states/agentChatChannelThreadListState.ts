import { type AgentChatThreadPagedList } from '@/ai/types/AgentChatThreadPagedList';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatChannelThreadList = AgentChatThreadPagedList & {
  viewKey: string;
};

export const agentChatChannelThreadListState =
  createAtomState<AgentChatChannelThreadList | null>({
    key: 'agentChatChannelThreadListState',
    defaultValue: null,
  });
