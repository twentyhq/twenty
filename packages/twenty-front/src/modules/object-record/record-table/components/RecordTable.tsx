import styled from '@emotion/styled';
import { isNonEmptyString, isNull } from '@sniptt/guards';

import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { RecordTableEmptyState } from '@/object-record/record-table/empty-state/components/RecordTableEmptyState';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyEffect';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { useRecoilValue } from 'recoil';

const StyledTable = styled.table`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
`;

type RecordTableProps = {
  viewBarId: string;
  recordTableId: string;
  objectNameSingular: string;
  onColumnsChange: (columns: any) => void;
};

export const RecordTable = ({
  viewBarId,
  recordTableId,
  objectNameSingular,
  onColumnsChange,
}: RecordTableProps) => {
  const { scopeId } = useRecordTableStates(recordTableId);

  const {
    isRecordTableInitialLoadingState,
    tableRowIdsState,
    pendingRecordIdState,
  } = useRecordTableStates(recordTableId);

  const isRecordTableInitialLoading = useRecoilValue(
    isRecordTableInitialLoadingState,
  );

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const pendingRecordId = useRecoilValue(pendingRecordIdState);

  const recordTableIsEmpty =
    !isRecordTableInitialLoading &&
    tableRowIds.length === 0 &&
    isNull(pendingRecordId);

  if (!isNonEmptyString(objectNameSingular)) {
    return <></>;
  }

  return (
    <RecordTableScope
      recordTableScopeId={scopeId}
      onColumnsChange={onColumnsChange}
    >
      <RecordTableContextProvider
        objectNameSingular={objectNameSingular}
        recordTableId={recordTableId}
        viewBarId={viewBarId}
      >
        <RecordTableBodyEffect />
        {recordTableIsEmpty ? (
          <RecordTableEmptyState />
        ) : (
          <StyledTable className="entity-table-cell">
            <RecordTableHeader
              objectMetadataNameSingular={objectNameSingular}
            />
            <RecordTableBody />
          </StyledTable>
        )}
      </RecordTableContextProvider>
    </RecordTableScope>
  );
};
