import {
  RecordTableRowSortable,
  type RecordTableRowSortableProps,
} from '@/object-record/record-table/record-table-row/components/RecordTableRowSortable';
import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';

type RecordTableRowSortableWithoutRecordGroupProps = Omit<
  RecordTableRowSortableProps,
  'index'
>;

export const RecordTableRowSortableWithoutRecordGroup = (
  recordTableRowSortableProps: RecordTableRowSortableWithoutRecordGroupProps,
) => {
  const recordTableRowIndexOfRecord = useAtomComponentFamilySelectorValue(
    recordTableRowIndexOfRecordComponentFamilySelector,
    recordTableRowSortableProps.recordId,
  );

  return (
    <RecordTableRowSortable
      {...recordTableRowSortableProps}
      index={recordTableRowIndexOfRecord ?? 0}
    />
  );
};
