import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

// The record store holds untyped records, so chat code reads threads here
export const agentChatThreadRecordFamilySelector = createAtomFamilySelector<
  AgentChatThreadRecord | null,
  string
>({
  key: 'agentChatThreadRecordFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      (get(recordStoreFamilyState, threadId) as
        | AgentChatThreadRecord
        | null
        | undefined) ?? null,
});
