import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableWidgetUIEditableEffect } from '@/object-record/record-table-widget/components/RecordTableWidgetUIEditableEffect';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { styled } from '@linaria/react';

const StyledTableContainer = styled.div`
  min-height: 0;
  overflow: hidden;
`;

type RecordTableWidgetProps = {
  isUIEditable?: boolean;
  isEmptyStateHidden?: boolean;
};

export const RecordTableWidget = ({
  isUIEditable = false,
  isEmptyStateHidden = false,
}: RecordTableWidgetProps) => {
  const { objectNameSingular, recordIndexId, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  return (
    <>
      <RecordTableWidgetUIEditableEffect
        recordTableId={recordIndexId}
        isUIEditable={isUIEditable}
        isEmptyStateHidden={isEmptyStateHidden}
      />
      <RecordIndexTableContainerEffect />
      <StyledTableContainer>
        <RecordTableWithWrappers
          recordTableId={recordIndexId}
          objectNameSingular={objectNameSingular}
          viewBarId={viewBarInstanceId}
        />
      </StyledTableContainer>
    </>
  );
};
