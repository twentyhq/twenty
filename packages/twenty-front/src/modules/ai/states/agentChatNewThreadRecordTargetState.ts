import { type AgentChatRecordTarget } from '@/ai/types/AgentChatRecordTarget';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// The new-chat draft has no thread yet, so the record it was started from is
// kept here until the thread is created and can be attached to it.
export const agentChatNewThreadRecordTargetState =
  createAtomState<AgentChatRecordTarget | null>({
    key: 'ai/agentChatNewThreadRecordTargetState',
    defaultValue: null,
  });
