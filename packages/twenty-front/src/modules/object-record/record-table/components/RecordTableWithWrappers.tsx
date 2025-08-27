import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { RecordTable } from '@/object-record/record-table/components/RecordTable';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { RecordUpdateContext } from '../contexts/EntityUpdateMutationHookContext';

const StyledTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100%;
`;

type RecordTableWithWrappersProps = {
  objectNameSingular: string;
  recordTableId: string;
  viewBarId: string;
  updateRecordMutation: (params: any) => void;
};

export const RecordTableWithWrappers = ({
  updateRecordMutation,
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

  const { deleteOneRecord } = useDeleteOneRecord({ objectNameSingular });

  return (
    <RecordTableComponentInstance recordTableId={recordTableId}>
      <RecordTableContextProvider
        recordTableId={recordTableId}
        viewBarId={viewBarId}
        objectNameSingular={objectNameSingular}
      >
        <EntityDeleteContext.Provider value={deleteOneRecord}>
          <ScrollWrapper
            componentInstanceId={`record-table-scroll-${recordTableId}`}
          >
            <RecordUpdateContext.Provider value={updateRecordMutation}>
              <StyledTableContainer>
                <RecordTable />
              </StyledTableContainer>
            </RecordUpdateContext.Provider>
          </ScrollWrapper>
        </EntityDeleteContext.Provider>
      </RecordTableContextProvider>
    </RecordTableComponentInstance>
  );
};
