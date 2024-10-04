import styled from '@emotion/styled';
import { useRef } from 'react';
import { useRecoilCallback } from 'recoil';

import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTable } from '@/object-record/record-table/components/RecordTable';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';

import { RecordUpdateContext } from '../contexts/EntityUpdateMutationHookContext';
import { useRecordTable } from '../hooks/useRecordTable';

import { RecordTableInternalEffect } from './RecordTableInternalEffect';

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
  const tableBodyRef = useRef<HTMLDivElement>(null);

  const { resetTableRowSelection, setRowSelected } = useRecordTable({
    recordTableId,
  });

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
      <ScrollWrapper contextProviderName="recordTableWithWrappers">
        <RecordUpdateContext.Provider value={updateRecordMutation}>
          <StyledTableWithHeader>
            <StyledTableContainer>
              <StyledTableInternalContainer ref={tableBodyRef}>
                <RecordTable
                  viewBarId={viewBarId}
                  recordTableId={recordTableId}
                  objectNameSingular={objectNameSingular}
                  onColumnsChange={handleColumnsChange}
                />
                <DragSelect
                  dragSelectable={tableBodyRef}
                  onDragSelectionStart={() => {
                    resetTableRowSelection();
                  }}
                  onDragSelectionChange={setRowSelected}
                />
              </StyledTableInternalContainer>
              <RecordTableInternalEffect
                recordTableId={recordTableId}
                tableBodyRef={tableBodyRef}
              />
            </StyledTableContainer>
          </StyledTableWithHeader>
        </RecordUpdateContext.Provider>
      </ScrollWrapper>
    </EntityDeleteContext.Provider>
  );
};
