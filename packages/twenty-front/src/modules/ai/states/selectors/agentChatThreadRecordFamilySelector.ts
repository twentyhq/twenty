import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

// The record store holds untyped records, so chat code reads threads here
export const inboxThreadRecordFamilySelector = createAtomFamilySelector<
  InboxThreadRecord | null,
  string
>({
  key: 'inboxThreadRecordFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      (get(recordStoreFamilyState, threadId) as
        | InboxThreadRecord
        | null
        | undefined) ?? null,
});
