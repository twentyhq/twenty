import { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { isRecordTableInitialLoadingState } from '@/object-record/record-table/states/isRecordTableInitialLoadingState';
import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';

import { RecordUpdateContext } from '../contexts/EntityUpdateMutationHookContext';
import { useRecordTable } from '../hooks/useRecordTable';
import { RecordTableScope } from '../scopes/RecordTableScope';
import { numberOfTableRowsState } from '../states/numberOfTableRowsState';

import { RecordTableBody } from './RecordTableBody';
import { RecordTableBodyEffect } from './RecordTableBodyEffect';
import { RecordTableHeader } from './RecordTableHeader';
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

const StyledTable = styled.table`
  border-collapse: collapse;

  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  margin-left: ${({ theme }) => theme.table.horizontalCellMargin};
  margin-right: ${({ theme }) => theme.table.horizontalCellMargin};
  table-layout: fixed;

  width: calc(100% - ${({ theme }) => theme.table.horizontalCellMargin} * 2);

  th {
    border: 1px solid ${({ theme }) => theme.border.color.light};
    border-collapse: collapse;
    color: ${({ theme }) => theme.font.color.tertiary};
    padding: 0;
    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-left-color: transparent;
      border-right-color: transparent;
    }
  }

  td {
    border: 1px solid ${({ theme }) => theme.border.color.light};
    border-collapse: collapse;
    color: ${({ theme }) => theme.font.color.primary};
    padding: 0;

    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-left-color: transparent;
      border-right-color: transparent;
    }
  }
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

type RecordTableProps = {
  recordTableId: string;
  viewBarId: string;
  updateRecordMutation: (params: any) => void;
  createRecord: () => void;
};

export const RecordTable = ({
  updateRecordMutation,
  createRecord,
  recordTableId,
  viewBarId,
}: RecordTableProps) => {
  const tableBodyRef = useRef<HTMLDivElement>(null);

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
        <RecordUpdateContext.Provider value={updateRecordMutation}>
          <StyledTableWithHeader>
            <StyledTableContainer>
              <div ref={tableBodyRef}>
                <StyledTable className="entity-table-cell">
                  <RecordTableHeader createRecord={createRecord} />
                  <RecordTableBodyEffect />
                  <RecordTableBody />
                </StyledTable>
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
      </ScrollWrapper>
    </RecordTableScope>
  );
};
