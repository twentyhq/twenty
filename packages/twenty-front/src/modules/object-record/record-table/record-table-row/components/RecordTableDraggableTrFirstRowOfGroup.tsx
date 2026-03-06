import { Draggable } from '@hello-pangea/dnd';
import { type ReactNode, useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableRowMultiDragPreview } from '@/object-record/record-table/record-table-row/components/RecordTableRowMultiDragPreview';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';

import { useIsTableRowSecondaryDragged } from '@/object-record/record-table/record-table-row/hooks/useIsRecordSecondaryDragged';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type RecordTableDraggableTrFirstRowOfGroupProps = {
  className?: string;
  recordId: string;
  draggableIndex: number;
  focusIndex: number;
  isDragDisabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  children: ReactNode;
};

export const RecordTableDraggableTrFirstRowOfGroup = ({
  className,
  recordId,
  draggableIndex,
  focusIndex,
  isDragDisabled,
  onClick,
  children,
}: RecordTableDraggableTrFirstRowOfGroupProps) => {
  const { theme } = useContext(ThemeContext);

  const { isSecondaryDragged } = useIsTableRowSecondaryDragged(recordId);

  const isRecordTableScrolledVertically = useAtomComponentStateValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  return (
    <Draggable
      draggableId={recordId}
      index={draggableIndex}
      isDragDisabled={isDragDisabled}
    >
      {(draggableProvided, draggableSnapshot) => (
        <>
          <RecordTableTr
            recordId={recordId}
            focusIndex={focusIndex}
            ref={draggableProvided.innerRef}
            className={className}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.draggableProps}
            style={{
              ...draggableProvided.draggableProps.style,
              background: draggableSnapshot.isDragging
                ? theme.background.transparent.light
                : undefined,
              borderColor: draggableSnapshot.isDragging
                ? `${theme.border.color.medium}`
                : 'transparent',
              opacity: isSecondaryDragged ? 0.3 : undefined,
            }}
            isDragging={draggableSnapshot.isDragging}
            data-testid={`row-id-${recordId}`}
            data-virtualized-id={recordId}
            data-selectable-id={recordId}
            onClick={onClick}
            isFirstRowOfGroup={true}
            isScrolledVertically={isRecordTableScrolledVertically}
          >
            <RecordTableRowDraggableContextProvider
              value={{
                isDragging: draggableSnapshot.isDragging,
                dragHandleProps: draggableProvided.dragHandleProps,
              }}
            >
              {children}
              <RecordTableRowMultiDragPreview />
            </RecordTableRowDraggableContextProvider>
          </RecordTableTr>
        </>
      )}
    </Draggable>
  );
};
