import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTable } from '@/object-record/record-table/components/RecordTable';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';
import styled from '@emotion/styled';
import { useRecoilCallback } from 'recoil';
import { RecordUpdateContext } from '../contexts/EntityUpdateMutationHookContext';
import { useRecordTable } from '../hooks/useRecordTable';

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
  const { selectAllRows, setHasUserSelectedAllRows } = useRecordTable({
    recordTableId,
  });

  const handleSelectAllRows = () => {
    setHasUserSelectedAllRows(true);
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

  const { saveViewFields } = useSaveCurrentViewFields();

  const { deleteOneRecord } = useDeleteOneRecord({ objectNameSingular });

  const handleColumnsChange = useRecoilCallback(
    () => (columns) => {
      saveViewFields(
        mapColumnDefinitionsToViewFields(
          columns as ColumnDefinition<FieldMetadata>[],
        ),
      );
    },
    [saveViewFields],
  );

  return (
    <RecordTableComponentInstance
      recordTableId={recordTableId}
      onColumnsChange={handleColumnsChange}
    >
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
