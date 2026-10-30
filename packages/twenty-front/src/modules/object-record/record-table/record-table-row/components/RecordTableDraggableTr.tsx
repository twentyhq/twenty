import { type ReactNode, useCallback, useContext, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { isRecordIdPrimaryDragComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragComponentFamilyState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableRowSortableInRecordGroup } from '@/object-record/record-table/record-table-row/components/RecordTableRowSortableInRecordGroup';
import { RecordTableRowSortableWithoutRecordGroup } from '@/object-record/record-table/record-table-row/components/RecordTableRowSortableWithoutRecordGroup';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { DRAG_SOURCE_OPACITY } from '@/ui/utilities/drag-and-drop/constants/DragSourceOpacity';
import { DragDropItemSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemSortableHandleRefContext';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

type RecordTableDraggableTrProps = {
  className?: string;
  recordId: string;
  isDragDisabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  children: ReactNode;
};

export const RecordTableDraggableTr = ({
  className,
  recordId,
  isDragDisabled,
  onClick,
  children,
}: RecordTableDraggableTrProps) => {
  const isRecordIdSecondaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId },
  );

  const isRecordIdPrimaryDrag = useAtomComponentFamilyStateValue(
    isRecordIdPrimaryDragComponentFamilyState,
    { recordId },
  );

  const { recordGroupId } = useContext(RecordGroupContext);

  const rowElementRef = useRef<HTMLDivElement>(null);
  const handleElementRef = useRef<Element>(null);

  const setHandleElement = useCallback((element: Element | null) => {
    handleElementRef.current = element;
  }, []);

  return (
    <RecordTableTr
      recordId={recordId}
      ref={rowElementRef}
      className={className}
      style={{
        opacity:
          isRecordIdPrimaryDrag || isRecordIdSecondaryDragMultiple
            ? DRAG_SOURCE_OPACITY
            : undefined,
      }}
      isDragging={false}
      data-testid={`row-id-${recordId}`}
      data-selectable-id={recordId}
      onClick={onClick}
    >
      <DragDropItemSortableHandleRefContext.Provider value={setHandleElement}>
        <RecordTableRowDraggableContextProvider value={{ isDragging: false }}>
          {children}
        </RecordTableRowDraggableContextProvider>
      </DragDropItemSortableHandleRefContext.Provider>
      {isDefined(recordGroupId) ? (
        <RecordTableRowSortableInRecordGroup
          recordId={recordId}
          recordGroupId={recordGroupId}
          isDragDisabled={isDragDisabled}
          rowElementRef={rowElementRef}
          handleElementRef={handleElementRef}
        />
      ) : (
        <RecordTableRowSortableWithoutRecordGroup
          recordId={recordId}
          isDragDisabled={isDragDisabled}
          rowElementRef={rowElementRef}
          handleElementRef={handleElementRef}
        />
      )}
    </RecordTableTr>
  );
};
