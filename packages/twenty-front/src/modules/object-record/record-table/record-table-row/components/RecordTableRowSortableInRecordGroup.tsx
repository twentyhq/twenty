import {
  RecordTableRowSortable,
  type RecordTableRowSortableProps,
} from '@/object-record/record-table/record-table-row/components/RecordTableRowSortable';
import { recordGroupRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordGroupRowIndexOfRecordComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';

type RecordTableRowSortableInRecordGroupProps = Omit<
  RecordTableRowSortableProps,
  'index'
> & {
  recordGroupId: string;
};

export const RecordTableRowSortableInRecordGroup = ({
  recordGroupId,
  ...recordTableRowSortableProps
}: RecordTableRowSortableInRecordGroupProps) => {
  const recordGroupRowIndexOfRecord = useAtomComponentFamilySelectorValue(
    recordGroupRowIndexOfRecordComponentFamilySelector,
    { recordGroupId, recordId: recordTableRowSortableProps.recordId },
  );

  return (
    <RecordTableRowSortable
      {...recordTableRowSortableProps}
      index={recordGroupRowIndexOfRecord ?? 0}
    />
  );
};
