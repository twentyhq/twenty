import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

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
