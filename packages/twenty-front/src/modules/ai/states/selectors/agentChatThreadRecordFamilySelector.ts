import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

// The record store holds untyped records, so chat code reads threads here
export const aiChatThreadRecordFamilySelector = createAtomFamilySelector<
  AiChatThreadRecord | null,
  string
>({
  key: 'aiChatThreadRecordFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      (get(recordStoreFamilyState, threadId) as
        | AiChatThreadRecord
        | null
        | undefined) ?? null,
});
