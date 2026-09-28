import { type AgentChatRecordTarget } from '@/ai/types/AgentChatRecordTarget';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// A chat started from a record is filed under it on its first send, so the
// record follows the draft until then: the new-chat draft has no thread yet, and
// creating one moves the draft under its id.
export const agentChatPendingRecordTargetByDraftKeyState = createAtomState<
  Record<string, AgentChatRecordTarget>
>({
  key: 'ai/agentChatPendingRecordTargetByDraftKeyState',
  defaultValue: {},
});
