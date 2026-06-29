import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { RecordTable } from '@/object-record/record-table/components/RecordTable';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { RecordTableRecordLimitReloadEffect } from '@/object-record/record-table/virtualization/components/RecordTableRecordLimitReloadEffect';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { styled } from '@linaria/react';

// The record table is virtualized: only the rows in the visible window exist in
// the DOM, positioned absolutely over a placeholder that fakes the full scroll
// height. It cannot paginate across a printout, so it is clipped to a single page
// when printing instead of stretching the placeholder into many blank pages.
const StyledRecordTablePrintBoundary = styled.div`
  display: contents;

  @media print {
    display: block;
    max-height: 100vh;
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
  const { selectAllRows } = useSelectAllRows(recordTableId);

  const handleSelectAllRows = () => {
    selectAllRows();
  };

  useHotkeysOnFocusedElement({
    keys: ['ctrl+a,meta+a'],
    callback: handleSelectAllRows,
    focusId: PageFocusId.RecordIndex,
    dependencies: [handleSelectAllRows],
    options: {
      enableOnFormTags: false,
    },
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
