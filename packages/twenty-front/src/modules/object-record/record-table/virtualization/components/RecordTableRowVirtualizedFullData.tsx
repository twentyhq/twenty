import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';
import { RecordTableRowCells } from '@/object-record/record-table/record-table-row/components/RecordTableRowCells';
import { RecordTableStaticTr } from '@/object-record/record-table/record-table-row/components/RecordTableStaticTr';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { RecordTableRowVirtualizedSkeleton } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedSkeleton';
import { recordIdByRealIndexComponentFamilySelector } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

type RecordTableRowVirtualizedFullDataProps = {
  realIndex: number;
};

export const RecordTableRowVirtualizedFullData = ({
  realIndex,
}: RecordTableRowVirtualizedFullDataProps) => {
  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const recordId = useAtomComponentFamilySelectorValue(
    recordIdByRealIndexComponentFamilySelector,
    realIndex,
  );

  if (!isDefined(recordId)) {
    return <RecordTableRowVirtualizedSkeleton />;
  }

  if (isRecordTableDragColumnHidden) {
    return (
      <RecordTableStaticTr recordId={recordId} focusIndex={realIndex}>
        <RecordTableRowCells rowIndexForFocus={realIndex} />
      </RecordTableStaticTr>
    );
  }

  return (
    <RecordTableDraggableTr
      recordId={recordId}
      draggableIndex={realIndex}
      focusIndex={realIndex}
    >
      <RecordTableRowCells rowIndexForFocus={realIndex} />
    </RecordTableDraggableTr>
  );
};
