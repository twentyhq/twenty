import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableWidgetContentEditableEffect } from '@/object-record/record-table-widget/components/RecordTableWidgetContentEditableEffect';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { styled } from '@linaria/react';

const StyledTableContainer = styled.div`
  min-height: 0;
  overflow: hidden;
`;

type RecordTableWidgetProps = {
  isWidgetContentEditable?: boolean;
  isEmptyStateHidden?: boolean;
};

export const RecordTableWidget = ({
  isWidgetContentEditable = false,
  isEmptyStateHidden = false,
}: RecordTableWidgetProps) => {
  const { objectNameSingular, recordIndexId, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  return (
    <>
      <RecordTableWidgetContentEditableEffect
        recordTableId={recordIndexId}
        isWidgetContentEditable={isWidgetContentEditable}
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
