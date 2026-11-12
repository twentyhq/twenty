import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatThreadLiveFields = {
  updateCount: number;
  fieldUpdateCountsByThreadId: Record<string, Record<string, number>>;
};

export const agentChatThreadLiveFieldsState =
  createAtomState<AgentChatThreadLiveFields>({
    key: 'agentChatThreadLiveFieldsState',
    defaultValue: { updateCount: 0, fieldUpdateCountsByThreadId: {} },
  });
