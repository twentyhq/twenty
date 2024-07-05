import { ReactNode, useContext } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTheme } from '@emotion/react';
import { Draggable } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';

export const RecordTableRowWrapper = ({
  recordId,
  rowIndex,
  isPendingRow,
  children,
}: {
  recordId: string;
  rowIndex: number;
  isPendingRow?: boolean;
  children: ReactNode;
}) => {
  const { objectMetadataItem } = useContext(RecordTableContext);

  const theme = useTheme();

  const { isRowSelectedFamilyState } = useRecordTableStates();
  const currentRowSelected = useRecoilValue(isRowSelectedFamilyState(recordId));

  const scrollWrapperRef = useContext(ScrollWrapperContext);

  const { ref: elementRef, inView } = useInView({
    root: scrollWrapperRef.current?.querySelector(
      '[data-overlayscrollbars-viewport="scrollbarHidden"]',
    ),
    rootMargin: '1000px',
  });

  return (
    <Draggable key={recordId} draggableId={recordId} index={rowIndex}>
      {(draggableProvided, draggableSnapshot) => (
        <RecordTableTr
          ref={(node) => {
            elementRef(node);
            draggableProvided.innerRef(node);
          }}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.draggableProps}
          style={{
            ...draggableProvided.draggableProps.style,
            background: draggableSnapshot.isDragging
              ? theme.background.transparent.light
              : 'none',
            borderColor: draggableSnapshot.isDragging
              ? `${theme.border.color.medium}`
              : 'transparent',
          }}
          isDragging={draggableSnapshot.isDragging}
          data-testid={`row-id-${recordId}`}
          data-selectable-id={recordId}
        >
          <RecordTableRowContext.Provider
            value={{
              recordId,
              rowIndex,
              pathToShowPage:
                getBasePathToShowPage({
                  objectNameSingular: objectMetadataItem.nameSingular,
                }) + recordId,
              objectNameSingular: objectMetadataItem.nameSingular,
              isSelected: currentRowSelected,
              isReadOnly: objectMetadataItem.isRemote ?? false,
              isPendingRow,
              isDragging: draggableSnapshot.isDragging,
              dragHandleProps: draggableProvided.dragHandleProps,
              inView,
            }}
          >
            {children}
          </RecordTableRowContext.Provider>
        </RecordTableTr>
      )}
    </Draggable>
  );
};
