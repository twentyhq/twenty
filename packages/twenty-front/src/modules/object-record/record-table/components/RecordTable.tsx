import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';

import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyEffect';
import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';

const StyledTable = styled.table`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  margin-right: ${({ theme }) => theme.table.horizontalCellMargin};
  table-layout: fixed;

  width: calc(100% - ${({ theme }) => theme.table.horizontalCellMargin} * 2);
`;

type RecordTableProps = {
  recordTableId: string;
  objectNameSingular: string;
  onColumnsChange: (columns: any) => void;
  createRecord: () => void;
};

export const RecordTable = ({
  recordTableId,
  objectNameSingular,
  onColumnsChange,
  createRecord,
}: RecordTableProps) => {
  const { scopeId } = useRecordTableStates(recordTableId);

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
      >
        <StyledTable className="entity-table-cell">
          <RecordTableHeader createRecord={createRecord} />
          <RecordTableBodyEffect />
          <RecordTableBody />
        </StyledTable>
      </RecordTableContextProvider>
    </RecordTableScope>
  );
};
