import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';

export const useRecordTableRowIndex = () => {
  const { recordId } = useRecordTableRowContextOrThrow();

  return useAtomComponentFamilySelectorValue(
    recordTableRowIndexOfRecordComponentFamilySelector,
    recordId,
  );
};
