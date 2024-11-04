import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';

import { RecordGroupContextProvider } from '@/object-record/record-group/components/RecordGroupContextProvider';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { RecordTableEmptyHandler } from '@/object-record/record-table/empty-state/components/RecordTableEmptyHandler';
import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyEffect';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';

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
  if (!isNonEmptyString(objectNameSingular)) {
    return <></>;
  }

  return (
    <RecordTableComponentInstance
      recordTableId={recordTableId}
      onColumnsChange={onColumnsChange}
    >
      <RecordTableContextProvider
        objectNameSingular={objectNameSingular}
        recordTableId={recordTableId}
        viewBarId={viewBarId}
      >
        <RecordGroupContextProvider objectNameSingular={objectNameSingular}>
          <RecordTableBodyEffect />
          <RecordTableEmptyHandler recordTableId={recordTableId}>
            <StyledTable className="entity-table-cell">
              <RecordTableHeader
                objectMetadataNameSingular={objectNameSingular}
              />
              <RecordTableBody />
            </StyledTable>
          </RecordTableEmptyHandler>
        </RecordGroupContextProvider>
      </RecordTableContextProvider>
    </RecordTableComponentInstance>
  );
};
