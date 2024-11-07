import { useTheme } from '@emotion/react';
import { Draggable } from '@hello-pangea/dnd';
import { ReactNode, useContext, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { tableCellWidthsComponentState } from '@/object-record/record-table/states/tableCellWidthsComponentState';
import { RecordTableWithWrappersScrollWrapperContext } from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';

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
  const trRef = useRef<HTMLTableRowElement>(null);

  const { objectMetadataItem } = useContext(RecordTableContext);
  const { onIndexRecordsLoaded } = useContext(RecordIndexRootPropsContext);

  const theme = useTheme();

  const currentRowSelected = useRecoilComponentFamilyValueV2(
    isRowSelectedComponentFamilyState,
    recordId,
  );

  const scrollWrapperRef = useContext(
    RecordTableWithWrappersScrollWrapperContext,
  );

  const { ref: elementRef, inView } = useInView({
    root: scrollWrapperRef.ref.current?.querySelector(
      '[data-overlayscrollbars-viewport]',
    ),
    rootMargin: '1000px',
  });

  const [, setTableCellWidths] = useRecoilComponentStateV2(
    tableCellWidthsComponentState,
  );

  useEffect(() => {
    if (rowIndex === 0) {
      const tdArray = Array.from(
        trRef.current?.getElementsByTagName('td') ?? [],
      );

      const tdWidths = tdArray.map((td) => {
        return td.getBoundingClientRect().width;
      });

      setTableCellWidths(tdWidths);
    }
  }, [trRef, rowIndex, setTableCellWidths]);

  // TODO: find a better way to emit this event
  useEffect(() => {
    if (inView) {
      onIndexRecordsLoaded?.();
    }
  }, [inView, onIndexRecordsLoaded]);

  return (
    <Draggable key={recordId} draggableId={recordId} index={rowIndex}>
      {(draggableProvided, draggableSnapshot) => (
        <RecordTableTr
          ref={(node) => {
            // @ts-expect-error - TS doesn't know that node.current is assignable
            trRef.current = node;
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
