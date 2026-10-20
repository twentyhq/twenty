import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordGroupRowIndexByRecordIdComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordGroupRowIndexByRecordIdComponentFamilySelector';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const recordGroupRowIndexOfRecordComponentFamilySelector =
  createAtomComponentFamilySelector<
    number | null,
    { recordGroupId: string; recordId: string }
  >({
    key: 'recordGroupRowIndexOfRecordComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey: { recordGroupId, recordId } }) =>
      ({ get }) =>
        get(recordGroupRowIndexByRecordIdComponentFamilySelector, {
          instanceId,
          familyKey: recordGroupId,
        }).get(recordId) ?? null,
  });
