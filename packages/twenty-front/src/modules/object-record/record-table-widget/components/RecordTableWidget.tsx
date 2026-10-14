import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableWidgetStatesEffect } from '@/object-record/record-table-widget/components/RecordTableWidgetStatesEffect';
import { canEditRecordTableWidgetViewSettings } from '@/object-record/record-table-widget/utils/canEditRecordTableWidgetViewSettings';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
  const recordTableWidgetContext = useContext(RecordTableWidgetContext);

  return (
    <>
      <RecordTableWidgetStatesEffect
        recordTableId={recordIndexId}
        isUIEditable={isUIEditable}
        isPageLayoutInEditMode={
          isDefined(recordTableWidgetContext) &&
          canEditRecordTableWidgetViewSettings(recordTableWidgetContext)
        }
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
