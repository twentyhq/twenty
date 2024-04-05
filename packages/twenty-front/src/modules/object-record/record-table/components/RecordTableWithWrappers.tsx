import { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { IconPlus } from 'twenty-ui';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTable } from '@/object-record/record-table/components/RecordTable';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';

import { RecordUpdateContext } from '../contexts/EntityUpdateMutationHookContext';
import { useRecordTable } from '../hooks/useRecordTable';

import { RecordTableInternalEffect } from './RecordTableInternalEffect';

const StyledTableWithHeader = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const StyledTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

type RecordTableWithWrappersProps = {
  objectNameSingular: string;
  recordTableId: string;
  viewBarId: string;
  updateRecordMutation: (params: any) => void;
  createRecord: () => Promise<void>;
};

export const RecordTableWithWrappers = ({
  updateRecordMutation,
  createRecord,
  objectNameSingular,
  recordTableId,
  viewBarId,
}: RecordTableWithWrappersProps) => {
  const tableBodyRef = useRef<HTMLDivElement>(null);

  const { numberOfTableRowsState, isRecordTableInitialLoadingState } =
    useRecordTableStates(recordTableId);

  const numberOfTableRows = useRecoilValue(numberOfTableRowsState);

  const isRecordTableInitialLoading = useRecoilValue(
    isRecordTableInitialLoadingState,
  );

  const { resetTableRowSelection, setRowSelected } = useRecordTable({
    recordTableId,
  });

  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNameSingular,
    },
  );

  const { saveViewFields } = useSaveCurrentViewFields(viewBarId);

  const { deleteOneRecord } = useDeleteOneRecord({ objectNameSingular });

  const objectLabel = foundObjectMetadataItem?.labelSingular;

  return (
    <EntityDeleteContext.Provider value={deleteOneRecord}>
      <ScrollWrapper>
        <RecordUpdateContext.Provider value={updateRecordMutation}>
          <StyledTableWithHeader>
            <StyledTableContainer>
              <div ref={tableBodyRef}>
                <RecordTable
                  recordTableId={recordTableId}
                  objectNameSingular={objectNameSingular}
                  onColumnsChange={useRecoilCallback(
                    () => (columns) => {
                      saveViewFields(
                        mapColumnDefinitionsToViewFields(
                          columns as ColumnDefinition<FieldMetadata>[],
                        ),
                      );
                    },
                    [saveViewFields],
                  )}
                  createRecord={createRecord}
                />
                <DragSelect
                  dragSelectable={tableBodyRef}
                  onDragSelectionStart={resetTableRowSelection}
                  onDragSelectionChange={setRowSelected}
                />
              </div>
              <RecordTableInternalEffect
                recordTableId={recordTableId}
                tableBodyRef={tableBodyRef}
              />
              {!isRecordTableInitialLoading && numberOfTableRows === 0 && (
                <AnimatedPlaceholderEmptyContainer>
                  <AnimatedPlaceholder type="noRecord" />
                  <AnimatedPlaceholderEmptyTextContainer>
                    <AnimatedPlaceholderEmptyTitle>
                      Add your first {objectLabel}
                    </AnimatedPlaceholderEmptyTitle>
                    <AnimatedPlaceholderEmptySubTitle>
                      Use our API or add your first {objectLabel} manually
                    </AnimatedPlaceholderEmptySubTitle>
                  </AnimatedPlaceholderEmptyTextContainer>
                  <Button
                    Icon={IconPlus}
                    title={`Add a ${objectLabel}`}
                    variant={'secondary'}
                    onClick={createRecord}
                  />
                </AnimatedPlaceholderEmptyContainer>
              )}
            </StyledTableContainer>
          </StyledTableWithHeader>
        </RecordUpdateContext.Provider>
      </ScrollWrapper>
    </EntityDeleteContext.Provider>
  );
};
