import { ReactNode, useContext, useEffect } from 'react';

import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableWithWrappersScrollWrapperContext } from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useInView } from 'react-intersection-observer';

type RecordTableRowWrapperProps = {
  recordId: string;
  rowIndexForFocus: number;
  rowIndexForDrag: number;
  isPendingRow?: boolean;
  children: ReactNode;
};

export const RecordTableRowWrapper = ({
  recordId,
  rowIndexForFocus,
  rowIndexForDrag,
  isPendingRow,
  children,
}: RecordTableRowWrapperProps) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const currentRowSelected = useRecoilComponentFamilyValueV2(
    isRowSelectedComponentFamilyState,
    recordId,
  );

  const { onIndexRecordsLoaded } = useRecordIndexContextOrThrow();

  const scrollWrapperRef = useContext(
    RecordTableWithWrappersScrollWrapperContext,
  );

  const { ref: elementRef, inView } = useInView({
    root: scrollWrapperRef.ref.current?.querySelector(
      '[data-overlayscrollbars-viewport]',
    ),
    rootMargin: '1000px',
  });

  // TODO: find a better way to emit this event
  useEffect(() => {
    if (inView) {
      onIndexRecordsLoaded?.();
    }
  }, [inView, onIndexRecordsLoaded]);

  return (
    <RecordTableDraggableTr
      ref={elementRef}
      key={recordId}
      draggableId={recordId}
      draggableIndex={rowIndexForDrag}
      isDragDisabled={isPendingRow}
    >
      <RecordTableRowContextProvider
        value={{
          recordId,
          rowIndex: rowIndexForFocus,
          pathToShowPage:
            getBasePathToShowPage({
              objectNameSingular: objectMetadataItem.nameSingular,
            }) + recordId,
          objectNameSingular: objectMetadataItem.nameSingular,
          isSelected: currentRowSelected,
          isPendingRow,
          inView,
        }}
      >
        {children}
      </RecordTableRowContextProvider>
    </RecordTableDraggableTr>
  );
};
