import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableWidgetSetReadOnlyColumnHeadersEffect } from '@/object-record/record-table-widget/components/RecordTableWidgetSetReadOnlyColumnHeadersEffect';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTableContainer = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-height: 0;
  overflow: hidden;
`;

type RecordTableWidgetProps = {
  isReadOnly?: boolean;
  isEmptyStateHidden?: boolean;
  recordLimit?: number;
};

export const RecordTableWidget = ({
  isReadOnly = true,
  isEmptyStateHidden = false,
  recordLimit,
}: RecordTableWidgetProps) => {
  const { objectNameSingular, recordIndexId, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  return (
    <>
      <RecordTableWidgetSetReadOnlyColumnHeadersEffect
        recordTableId={recordIndexId}
        isReadOnly={isReadOnly}
        isEmptyStateHidden={isEmptyStateHidden}
      />
      <RecordIndexTableContainerEffect />
      <StyledTableContainer>
        <RecordTableWithWrappers
          recordTableId={recordIndexId}
          objectNameSingular={objectNameSingular}
          viewBarId={viewBarInstanceId}
          recordLimit={recordLimit}
        />
      </StyledTableContainer>
    </>
  );
};
