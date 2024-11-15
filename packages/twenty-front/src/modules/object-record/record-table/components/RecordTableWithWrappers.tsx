import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTable } from '@/object-record/record-table/components/RecordTable';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';

import { isScrollEnabledForRecordTableState } from '@/object-record/record-table/states/isScrollEnabledForRecordTableState';
import { RecordUpdateContext } from '../contexts/EntityUpdateMutationHookContext';

const StyledTableWithHeader = styled.div`
  height: 100%;
`;

const StyledTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

const StyledTableInternalContainer = styled.div`
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
  const isScrollEnabledForRecordTable = useRecoilValue(
    isScrollEnabledForRecordTableState,
  );

  const { saveViewFields } = useSaveCurrentViewFields(viewBarId);

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
    <EntityDeleteContext.Provider value={deleteOneRecord}>
      <ScrollWrapper
        enableXScroll={isScrollEnabledForRecordTable.enableXScroll}
        enableYScroll={isScrollEnabledForRecordTable.enableYScroll}
        contextProviderName="recordTableWithWrappers"
      >
        <RecordUpdateContext.Provider value={updateRecordMutation}>
          <StyledTableWithHeader>
            <StyledTableContainer>
              <StyledTableInternalContainer>
                <RecordTable
                  viewBarId={viewBarId}
                  recordTableId={recordTableId}
                  objectNameSingular={objectNameSingular}
                  onColumnsChange={handleColumnsChange}
                />
              </StyledTableInternalContainer>
            </StyledTableContainer>
          </StyledTableWithHeader>
        </RecordUpdateContext.Provider>
      </ScrollWrapper>
    </EntityDeleteContext.Provider>
  );
};
