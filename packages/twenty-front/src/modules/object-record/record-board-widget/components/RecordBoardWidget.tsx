import { RecordBoardContainer } from '@/object-record/record-board/components/RecordBoardContainer';
import { RecordBoardWidgetStatesEffect } from '@/object-record/record-board-widget/components/RecordBoardWidgetStatesEffect';
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
  isUIEditable?: boolean;
};

export const RecordBoardWidget = ({
  isUIEditable = false,
}: RecordBoardWidgetProps) => {
  const { objectNameSingular, recordIndexId, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  return (
    <>
      <RecordBoardWidgetStatesEffect
        recordBoardId={recordIndexId}
        isUIEditable={isUIEditable}
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
