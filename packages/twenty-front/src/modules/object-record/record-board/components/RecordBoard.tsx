import { styled } from '@linaria/react';

import { type CSSProperties, useContext, useRef } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordBoardColumns } from '@/object-record/record-board/components/RecordBoardColumns';
import { RecordBoardDragDropContext } from '@/object-record/record-board/components/RecordBoardDragDropContext';
import { RecordBoardDragSelect } from '@/object-record/record-board/components/RecordBoardDragSelect';
import { RecordBoardEffects } from '@/object-record/record-board/components/RecordBoardEffects';
import { RecordBoardFetchMoreInViewTriggerComponent } from '@/object-record/record-board/components/RecordBoardFetchMoreInViewTriggerComponent';
import { RecordBoardHeader } from '@/object-record/record-board/components/RecordBoardHeader';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCssVariableName';
import { getRecordBoardColumnWidthContainerId } from '@/object-record/record-board/utils/setRecordBoardColumnWidthCssVariable';
import { recordIndexKanbanColumnWidthComponentState } from '@/object-record/record-index/states/recordIndexKanbanColumnWidthComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 100%;
  position: relative;
`;

const StyledContainerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: min-content;
  min-height: calc(100% - ${themeCssVariables.spacing[2]});
`;

const StyledBoardContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export const RecordBoard = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const boardRef = useRef<HTMLDivElement>(null);

  const recordIndexKanbanColumnWidth = useAtomComponentStateValue(
    recordIndexKanbanColumnWidthComponentState,
  );

  return (
    <>
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-record-board-${recordBoardId}`}
      >
        <RecordBoardEffects />
        <StyledContainerContainer
          id={getRecordBoardColumnWidthContainerId(recordBoardId)}
          style={
            {
              [RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME]: `${recordIndexKanbanColumnWidth}px`,
            } as CSSProperties
          }
        >
          <RecordBoardHeader />
          <StyledBoardContentContainer>
            <StyledContainer ref={boardRef}>
              <RecordBoardDragDropContext>
                <RecordBoardColumns />
              </RecordBoardDragDropContext>
              <RecordBoardDragSelect boardRef={boardRef} />
              <RecordBoardFetchMoreInViewTriggerComponent />
            </StyledContainer>
          </StyledBoardContentContainer>
        </StyledContainerContainer>
      </ScrollWrapper>
    </>
  );
};
