import styled from '@emotion/styled';
import { isNonEmptyString, isNull } from '@sniptt/guards';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { RecordTableEmptyState } from '@/object-record/record-table/components/RecordTableEmptyState';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyEffect';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { useRecoilValue } from 'recoil';

const StyledTable = styled.table`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  margin-right: ${({ theme }) => theme.table.horizontalCellMargin};
  table-layout: fixed;

  width: calc(100% - ${({ theme }) => theme.table.horizontalCellMargin} * 2);
`;

type RecordTableProps = {
  viewBarId: string;
  recordTableId: string;
  objectNameSingular: string;
  onColumnsChange: (columns: any) => void;
  createRecord: () => void;
};

export const RecordTable = ({
  viewBarId,
  recordTableId,
  objectNameSingular,
  onColumnsChange,
  createRecord,
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

  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    { objectNameSingular },
  );

  const objectLabel = foundObjectMetadataItem?.labelSingular;
  const isRemote = foundObjectMetadataItem?.isRemote ?? false;

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
        {!isRecordTableInitialLoading &&
        tableRowIds.length === 0 &&
        isNull(pendingRecordId) ? (
          <RecordTableEmptyState
            objectNameSingular={objectNameSingular}
            objectLabel={objectLabel}
            createRecord={createRecord}
            isRemote={isRemote}
          />
        ) : (
          <StyledTable className="entity-table-cell">
            <RecordTableHeader createRecord={createRecord} />
            <RecordTableBody />
          </StyledTable>
        )}
      </RecordTableContextProvider>
    </RecordTableScope>
  );
};
