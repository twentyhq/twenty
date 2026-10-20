import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableRowIndexByRecordIdComponentSelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexByRecordIdComponentSelector';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const recordTableRowIndexOfRecordComponentFamilySelector =
  createAtomComponentFamilySelector<number | null, string>({
    key: 'recordTableRowIndexOfRecordComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) =>
        get(recordTableRowIndexByRecordIdComponentSelector, {
          instanceId,
        }).get(familyKey) ?? null,
  });
