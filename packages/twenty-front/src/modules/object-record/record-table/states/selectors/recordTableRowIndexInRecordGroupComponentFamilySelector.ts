import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const recordTableRowIndexInRecordGroupComponentFamilySelector =
  createAtomComponentFamilySelector<
    number | null,
    { recordGroupId: string | undefined; recordId: string }
  >({
    key: 'recordTableRowIndexInRecordGroupComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey: { recordGroupId, recordId } }) =>
      ({ get }) => {
        if (recordGroupId === undefined) {
          return null;
        }

        const rowIndexInRecordGroup = get(
          recordIndexRecordIdsByGroupComponentFamilyState,
          { instanceId, familyKey: recordGroupId },
        ).indexOf(recordId);

        return rowIndexInRecordGroup >= 0 ? rowIndexInRecordGroup : null;
      },
  });
