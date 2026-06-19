import { styled } from '@linaria/react';

import { useContext, useEffect, useRef, type CSSProperties } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordBoardColumns } from '@/object-record/record-board/components/RecordBoardColumns';
import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCSSVariableName';
import { RecordBoardDragDropContext } from '@/object-record/record-board/components/RecordBoardDragDropContext';
import { RecordBoardDragSelect } from '@/object-record/record-board/components/RecordBoardDragSelect';
import { RecordBoardEffects } from '@/object-record/record-board/components/RecordBoardEffects';
import { RecordBoardFetchMoreInViewTriggerComponent } from '@/object-record/record-board/components/RecordBoardFetchMoreInViewTriggerComponent';
import { RecordBoardHeader } from '@/object-record/record-board/components/RecordBoardHeader';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { recordBoardColumnWidthComponentState } from '@/object-record/record-board/states/recordBoardColumnWidthComponentState';
import { clampRecordBoardColumnWidth } from '@/object-record/record-board/utils/clampRecordBoardColumnWidth';
import { getRecordBoardHtmlId } from '@/object-record/record-board/utils/getRecordBoardHtmlId';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

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
  const { currentView } = useGetCurrentViewOnly();

  const [recordBoardColumnWidth, setRecordBoardColumnWidth] =
    useAtomComponentState(recordBoardColumnWidthComponentState);

  useEffect(() => {
    const persistedColumnWidth =
      currentView?.kanbanColumnWidth ?? RECORD_BOARD_COLUMN_WIDTH;

    setRecordBoardColumnWidth(
      clampRecordBoardColumnWidth(persistedColumnWidth),
    );
  }, [
    currentView?.id,
    currentView?.kanbanColumnWidth,
    setRecordBoardColumnWidth,
  ]);

  const recordBoardColumnWidthStyle = {
    [RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME]: `${recordBoardColumnWidth}px`,
  } as CSSProperties;

  return (
    <>
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-record-board-${recordBoardId}`}
      >
        <RecordBoardEffects />
        <StyledContainerContainer
          id={getRecordBoardHtmlId(recordBoardId)}
          style={recordBoardColumnWidthStyle}
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
