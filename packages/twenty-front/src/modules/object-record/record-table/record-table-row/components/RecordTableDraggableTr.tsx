import { useTheme } from '@emotion/react';
import { Draggable, DraggableId } from '@hello-pangea/dnd';
import { ReactNode } from 'react';

import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableDraggableTrEffect } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTrEffect';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isRowVisibleComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowVisibleComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';

type RecordTableDraggableTrProps = {
  className?: string;
  draggableId: DraggableId;
  draggableIndex: number;
  focusIndex: number;
  isDragDisabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  children: ReactNode;
};

export const RecordTableDraggableTr = ({
  className,
  draggableId,
  draggableIndex,
  focusIndex,
  isDragDisabled,
  onClick,
  children,
}: RecordTableDraggableTrProps) => {
  const theme = useTheme();
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const currentRowSelected = useRecoilComponentFamilyValueV2(
    isRowSelectedComponentFamilyState,
    draggableId,
  );

  const isRowVisible = useRecoilComponentFamilyValueV2(
    isRowVisibleComponentFamilyState,
    draggableId,
  );

  return (
    <>
      <RecordTableDraggableTrEffect recordId={draggableId} />
      <RecordTableRowContextProvider
        value={{
          recordId: draggableId,
          rowIndex: focusIndex,
          pathToShowPage:
            getBasePathToShowPage({
              objectNameSingular: objectMetadataItem.nameSingular,
            }) + draggableId,
          objectNameSingular: objectMetadataItem.nameSingular,
          isSelected: currentRowSelected,
          isPendingRow: false,
          inView: isRowVisible,
        }}
      >
        <Draggable
          draggableId={draggableId}
          index={draggableIndex}
          isDragDisabled={isDragDisabled}
        >
          {(draggableProvided, draggableSnapshot) => (
            <RecordTableTr
              ref={draggableProvided.innerRef}
              className={className}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...draggableProvided.draggableProps}
              style={{
                ...draggableProvided.draggableProps.style,
                background: draggableSnapshot.isDragging
                  ? theme.background.transparent.light
                  : undefined,
                borderColor: draggableSnapshot.isDragging
                  ? `${theme.border.color.medium}`
                  : 'transparent',
              }}
              isDragging={draggableSnapshot.isDragging}
              data-testid={`row-id-${draggableId}`}
              data-virtualized-id={draggableId}
              data-selectable-id={draggableId}
              onClick={onClick}
            >
              <RecordTableRowDraggableContextProvider
                value={{
                  isDragging: draggableSnapshot.isDragging,
                  dragHandleProps: draggableProvided.dragHandleProps,
                }}
              >
                {children}
              </RecordTableRowDraggableContextProvider>
            </RecordTableTr>
          )}
        </Draggable>
      </RecordTableRowContextProvider>
    </>
  );
};
