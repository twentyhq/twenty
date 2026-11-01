import { type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableRowSortable } from '@/object-record/record-table/record-table-row/components/RecordTableRowSortable';
import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';

type RecordTableRowSortableWithoutRecordGroupProps = {
  recordId: string;
  isDragDisabled?: boolean;
  rowElementRef: RefObject<HTMLDivElement | null>;
  handleElementRef: RefObject<Element | null>;
};

export const RecordTableRowSortableWithoutRecordGroup = ({
  recordId,
  isDragDisabled,
  rowElementRef,
  handleElementRef,
}: RecordTableRowSortableWithoutRecordGroupProps) => {
  const recordTableRowIndexOfRecord = useAtomComponentFamilySelectorValue(
    recordTableRowIndexOfRecordComponentFamilySelector,
    recordId,
  );

  if (!isDefined(recordTableRowIndexOfRecord)) {
    return null;
  }

  return (
    <RecordTableRowSortable
      recordId={recordId}
      index={recordTableRowIndexOfRecord}
      droppableId={NO_RECORD_GROUP_FAMILY_KEY}
      isDragDisabled={isDragDisabled}
      rowElementRef={rowElementRef}
      handleElementRef={handleElementRef}
    />
  );
};
