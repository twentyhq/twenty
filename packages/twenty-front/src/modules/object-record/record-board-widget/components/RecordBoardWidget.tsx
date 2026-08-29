import { RecordBoardContainer } from '@/object-record/record-board/components/RecordBoardContainer';
import { RecordBoardWidgetViewSettingsReadOnlyEffect } from '@/object-record/record-board-widget/components/RecordBoardWidgetViewSettingsReadOnlyEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { styled } from '@linaria/react';

const StyledBoardContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

type RecordBoardWidgetProps = {
  isReadOnly?: boolean;
};

export const RecordBoardWidget = ({
  isReadOnly = true,
}: RecordBoardWidgetProps) => {
  const { objectNameSingular, recordIndexId, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  return (
    <>
      <RecordBoardWidgetViewSettingsReadOnlyEffect
        recordBoardId={recordIndexId}
        isViewSettingsReadOnly={isReadOnly}
      />
      <StyledBoardContainer>
        <RecordBoardContainer
          recordBoardId={recordIndexId}
          viewBarId={viewBarInstanceId}
          objectNameSingular={objectNameSingular}
        />
      </StyledBoardContainer>
    </>
  );
};
