import { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { RecordTable } from '@/object-record/record-table/components/RecordTable';
import { RecordTableFirstColumnScrollEffect } from '@/object-record/record-table/components/RecordTableFirstColumnScrollObserver';
import { RecordTableRefContextWrapper } from '@/object-record/record-table/components/RecordTableRefContext';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  StyledEmptyContainer,
  StyledEmptySubTitle,
  StyledEmptyTextContainer,
  StyledEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';

import { RecordUpdateContext } from '../contexts/EntityUpdateMutationHookContext';
import { useRecordTable } from '../hooks/useRecordTable';

import { RecordTableInternalEffect } from './RecordTableInternalEffect';

const StyledTableWithHeader = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
`;

const StyledTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

type RecordTableWithWrappersProps = {
  objectNamePlural: string;
  recordTableId: string;
  viewBarId: string;
  updateRecordMutation: (params: any) => void;
  createRecord: () => Promise<void>;
};

export const RecordTableWithWrappers = ({
  updateRecordMutation,
  createRecord,
  objectNamePlural,
  recordTableId,
  viewBarId,
}: RecordTableWithWrappersProps) => {
  const tableBodyRef = useRef<HTMLDivElement>(null);

  const { getNumberOfTableRowsState, getIsRecordTableInitialLoadingState } =
    useRecordTableStates(recordTableId);

  const numberOfTableRows = useRecoilValue(getNumberOfTableRowsState());

  const isRecordTableInitialLoading = useRecoilValue(
    getIsRecordTableInitialLoadingState(),
  );

  const { resetTableRowSelection, setRowSelectedState } = useRecordTable({
    recordTableId,
  });

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNameSingular,
    },
  );

  const { persistViewFields } = useViewFields(viewBarId);

  const { deleteOneRecord } = useDeleteOneRecord({ objectNameSingular });

  return (
    <EntityDeleteContext.Provider value={deleteOneRecord}>
      <ScrollWrapper>
        <RecordTableRefContextWrapper>
          <RecordTableFirstColumnScrollEffect />
          <RecordUpdateContext.Provider value={updateRecordMutation}>
            <StyledTableWithHeader>
              <StyledTableContainer>
                <div ref={tableBodyRef}>
                  <RecordTable
                    recordTableId={recordTableId}
                    objectNamePlural={objectNamePlural}
                    onColumnsChange={useRecoilCallback(() => (columns) => {
                      persistViewFields(
                        mapColumnDefinitionsToViewFields(columns),
                      );
                    })}
                    createRecord={createRecord}
                  />
                  <DragSelect
                    dragSelectable={tableBodyRef}
                    onDragSelectionStart={resetTableRowSelection}
                    onDragSelectionChange={setRowSelectedState}
                  />
                </div>
                <RecordTableInternalEffect
                  recordTableId={recordTableId}
                  tableBodyRef={tableBodyRef}
                />
                {!isRecordTableInitialLoading && numberOfTableRows === 0 && (
                  <StyledEmptyContainer>
                    <AnimatedPlaceholder type="noRecord" />
                    <StyledEmptyTextContainer>
                      <StyledEmptyTitle>
                        Add your first {foundObjectMetadataItem?.namePlural}
                      </StyledEmptyTitle>
                      <StyledEmptySubTitle>
                        Use our API or add your first{' '}
                        {foundObjectMetadataItem?.namePlural} manually
                      </StyledEmptySubTitle>
                    </StyledEmptyTextContainer>
                    <Button
                      Icon={IconPlus}
                      title={`Add a ${foundObjectMetadataItem?.nameSingular}`}
                      variant={'secondary'}
                      onClick={createRecord}
                    />
                  </StyledEmptyContainer>
                )}
              </StyledTableContainer>
            </StyledTableWithHeader>
          </RecordUpdateContext.Provider>
        </RecordTableRefContextWrapper>
      </ScrollWrapper>
    </EntityDeleteContext.Provider>
  );
};
