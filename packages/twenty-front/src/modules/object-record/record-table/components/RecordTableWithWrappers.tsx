import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { RecordTable } from '@/object-record/record-table/components/RecordTable';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { useRecordTableSelectAllHotkeys } from '@/object-record/record-table/hooks/useRecordTableSelectAllHotkeys';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { RecordTableRecordLimitReloadEffect } from '@/object-record/record-table/virtualization/components/RecordTableRecordLimitReloadEffect';
import { PageFocusId } from '@/types/PageFocusId';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { styled } from '@linaria/react';

const StyledRecordTablePrintBoundary = styled.div`
  display: contents;

  // Otherwise swiping back to the first column triggers iOS back navigation.
  .scroll-wrapper-x-enabled {
    overscroll-behavior-x: contain;
  }

  @media print {
    display: block;
    max-height: calc(100vh / var(--t-zoom, 1));
    overflow: hidden;
  }
`;

type RecordTableWithWrappersProps = {
  objectNameSingular: string;
  recordTableId: string;
  viewBarId: string;
};

export const RecordTableWithWrappers = ({
  objectNameSingular,
  recordTableId,
  viewBarId,
}: RecordTableWithWrappersProps) => {
  useRecordTableSelectAllHotkeys({
    recordTableId,
    focusId: PageFocusId.RecordIndex,
  });

  const { activateRecordTableRow } = useActiveRecordTableRow(recordTableId);
  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const handleRecordIdentifierClick = (rowIndex: number, recordId: string) => {
    activateRecordTableRow(rowIndex);
    unfocusRecordTableRow();
    openRecordFromIndexView({ recordId });
  };

  const { deleteOneRecord } = useDeleteOneRecord({ objectNameSingular });

  return (
    <RecordTableComponentInstance recordTableId={recordTableId}>
      <RecordTableContextProvider
        recordTableId={recordTableId}
        viewBarId={viewBarId}
        objectNameSingular={objectNameSingular}
        onRecordIdentifierClick={handleRecordIdentifierClick}
      >
        <EntityDeleteContext.Provider value={deleteOneRecord}>
          <StyledRecordTablePrintBoundary>
            <ScrollWrapper
              componentInstanceId={`record-table-scroll-${recordTableId}`}
            >
              <RecordTableRecordLimitReloadEffect />
              <RecordTable />
            </ScrollWrapper>
          </StyledRecordTablePrintBoundary>
        </EntityDeleteContext.Provider>
      </RecordTableContextProvider>
    </RecordTableComponentInstance>
  );
};
