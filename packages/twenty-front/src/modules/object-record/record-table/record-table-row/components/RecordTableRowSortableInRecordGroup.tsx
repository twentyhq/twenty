import { type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { RecordTableRowSortable } from '@/object-record/record-table/record-table-row/components/RecordTableRowSortable';
import { recordGroupRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordGroupRowIndexOfRecordComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';

type RecordTableRowSortableInRecordGroupProps = {
  recordId: string;
  recordGroupId: string;
  isDragDisabled?: boolean;
  rowElementRef: RefObject<HTMLDivElement | null>;
  handleElementRef: RefObject<Element | null>;
};

export const RecordTableRowSortableInRecordGroup = ({
  recordId,
  recordGroupId,
  isDragDisabled,
  rowElementRef,
  handleElementRef,
}: RecordTableRowSortableInRecordGroupProps) => {
  const recordGroupRowIndexOfRecord = useAtomComponentFamilySelectorValue(
    recordGroupRowIndexOfRecordComponentFamilySelector,
    { recordGroupId, recordId },
  );

  if (!isDefined(recordGroupRowIndexOfRecord)) {
    return null;
  }

  return (
    <RecordTableRowSortable
      recordId={recordId}
      index={recordGroupRowIndexOfRecord}
      droppableId={recordGroupId}
      isDragDisabled={isDragDisabled}
      rowElementRef={rowElementRef}
      handleElementRef={handleElementRef}
    />
  );
};
