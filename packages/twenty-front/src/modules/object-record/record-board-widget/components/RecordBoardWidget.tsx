import { RecordBoardContainer } from '@/object-record/record-board/components/RecordBoardContainer';
import { RecordBoardWidgetContentEditableEffect } from '@/object-record/record-board-widget/components/RecordBoardWidgetContentEditableEffect';
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
  isWidgetContentEditable?: boolean;
};

export const RecordBoardWidget = ({
  isWidgetContentEditable = false,
}: RecordBoardWidgetProps) => {
  const { objectNameSingular, recordIndexId, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  return (
    <>
      <RecordBoardWidgetContentEditableEffect
        recordBoardId={recordIndexId}
        isWidgetContentEditable={isWidgetContentEditable}
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
