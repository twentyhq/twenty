import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const recordGroupRowIndexByRecordIdComponentFamilySelector =
  createAtomComponentFamilySelector<Map<string, number>, string>({
    key: 'recordGroupRowIndexByRecordIdComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey: recordGroupId }) =>
      ({ get }) =>
        new Map(
          get(recordIndexRecordIdsByGroupComponentFamilyState, {
            instanceId,
            familyKey: recordGroupId,
          }).map((recordId, rowIndex) => [recordId, rowIndex]),
        ),
  });
