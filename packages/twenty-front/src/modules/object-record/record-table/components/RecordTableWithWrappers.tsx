import { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { RecordTable } from '@/object-record/record-table/components/RecordTable';
import { RecordTableFirstColumnScrollObserver } from '@/object-record/record-table/components/RecordTableFirstColumnScrollObserver';
import { RecordTableRefContextWrapper } from '@/object-record/record-table/components/RecordTableRefContext';
import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';

import { RecordUpdateContext } from '../contexts/EntityUpdateMutationHookContext';
import { useRecordTable } from '../hooks/useRecordTable';
import { RecordTableScope } from '../scopes/RecordTableScope';

import { RecordTableInternalEffect } from './RecordTableInternalEffect';

const StyledObjectEmptyContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding-bottom: ${({ theme }) => theme.spacing(16)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledEmptyObjectTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledEmptyObjectSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

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
  recordTableId: string;
  viewBarId: string;
  updateRecordMutation: (params: any) => void;
  createRecord: () => void;
};

export const RecordTableWithWrappers = ({
  updateRecordMutation,
  createRecord,
  recordTableId,
  viewBarId,
}: RecordTableWithWrappersProps) => {
  const tableBodyRef = useRef<HTMLDivElement>(null);

  const {
    numberOfTableRowsScopeInjector,
    isRecordTableInitialLoadingScopeInjector,
  } = getRecordTableScopeInjector();

  const { injectStateWithRecordTableScopeId } =
    useRecordTableScopedStates(recordTableId);

  const numberOfTableRowsState = injectStateWithRecordTableScopeId(
    numberOfTableRowsScopeInjector,
  );

  const isRecordTableInitialLoadingState = injectStateWithRecordTableScopeId(
    isRecordTableInitialLoadingScopeInjector,
  );

  const numberOfTableRows = useRecoilValue(numberOfTableRowsState);

  const isRecordTableInitialLoading = useRecoilValue(
    isRecordTableInitialLoadingState,
  );

  const {
    scopeId: objectNamePlural,
    resetTableRowSelection,
    setRowSelectedState,
  } = useRecordTable({
    recordTableScopeId: recordTableId,
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

  return (
    <RecordTableScope
      recordTableScopeId={recordTableId}
      onColumnsChange={useRecoilCallback(() => (columns) => {
        persistViewFields(mapColumnDefinitionsToViewFields(columns));
      })}
    >
      <ScrollWrapper>
        <RecordTableRefContextWrapper>
          <RecordTableFirstColumnScrollObserver />
          <RecordUpdateContext.Provider value={updateRecordMutation}>
            <StyledTableWithHeader>
              <StyledTableContainer>
                <div ref={tableBodyRef}>
                  <RecordTable createRecord={createRecord} />
                  <DragSelect
                    dragSelectable={tableBodyRef}
                    onDragSelectionStart={resetTableRowSelection}
                    onDragSelectionChange={setRowSelectedState}
                  />
                </div>
                <RecordTableInternalEffect tableBodyRef={tableBodyRef} />
                {!isRecordTableInitialLoading && numberOfTableRows === 0 && (
                  <StyledObjectEmptyContainer>
                    <StyledEmptyObjectTitle>
                      No {foundObjectMetadataItem?.namePlural}
                    </StyledEmptyObjectTitle>
                    <StyledEmptyObjectSubTitle>
                      Create one:
                    </StyledEmptyObjectSubTitle>
                    <Button
                      Icon={IconPlus}
                      title={`Add a ${foundObjectMetadataItem?.nameSingular}`}
                      variant={'secondary'}
                      onClick={createRecord}
                    />
                  </StyledObjectEmptyContainer>
                )}
              </StyledTableContainer>
            </StyledTableWithHeader>
          </RecordUpdateContext.Provider>
        </RecordTableRefContextWrapper>
      </ScrollWrapper>
    </RecordTableScope>
  );
};
