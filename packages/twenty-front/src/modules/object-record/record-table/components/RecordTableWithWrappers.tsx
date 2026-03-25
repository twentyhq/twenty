import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { RecordTable } from '@/object-record/record-table/components/RecordTable';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

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
          <ScrollWrapper
            componentInstanceId={`record-table-scroll-${recordTableId}`}
          >
            <RecordTable />
          </ScrollWrapper>
        </EntityDeleteContext.Provider>
      </RecordTableContextProvider>
    </RecordTableComponentInstance>
  );
};
