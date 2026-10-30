import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const isRecordTableFirstRowComponentFamilySelector =
  createAtomComponentFamilySelector<boolean, string>({
    key: 'isRecordTableFirstRowComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) =>
        get(recordTableRowIndexOfRecordComponentFamilySelector, {
          instanceId,
          familyKey,
        }) === 0,
  });
