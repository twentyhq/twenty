import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const recordTableRowIndexByRecordIdInRecordGroupComponentFamilySelector =
  createAtomComponentFamilySelector<Map<string, number>, string>({
    key: 'recordTableRowIndexByRecordIdInRecordGroupComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) =>
        new Map(
          get(recordIndexRecordIdsByGroupComponentFamilyState, {
            instanceId,
            familyKey,
          }).map((recordId, rowIndex) => [recordId, rowIndex]),
        ),
  });
