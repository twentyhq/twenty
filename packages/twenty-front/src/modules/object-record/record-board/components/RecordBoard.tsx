import styled from '@emotion/styled';

import { useContext, useRef } from 'react';

import { RecordBoardClickOutsideEffect } from '@/object-record/record-board/components/RecordBoardClickOutsideEffect';
import { RecordBoardColumns } from '@/object-record/record-board/components/RecordBoardColumns';
import { RecordBoardDragDropContext } from '@/object-record/record-board/components/RecordBoardDragDropContext';
import { RecordBoardDragSelect } from '@/object-record/record-board/components/RecordBoardDragSelect';
import { RecordBoardFetchMoreInViewTriggerComponent } from '@/object-record/record-board/components/RecordBoardFetchMoreInViewTriggerComponent';
import { RecordBoardHeader } from '@/object-record/record-board/components/RecordBoardHeader';
import { RecordBoardQueryEffect } from '@/object-record/record-board/components/RecordBoardQueryEffect';
import { RecordBoardScrollToFocusedCardEffect } from '@/object-record/record-board/components/RecordBoardScrollToFocusedCardEffect';
import { RecordBoardSelectRecordsEffect } from '@/object-record/record-board/components/RecordBoardSelectRecordsEffect';
import { RecordBoardStickyHeaderEffect } from '@/object-record/record-board/components/RecordBoardStickyHeaderEffect';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardDeactivateBoardCardEffect } from '@/object-record/record-board/record-board-card/components/RecordBoardDeactivateBoardCardEffect';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

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
  min-height: calc(100% - ${({ theme }) => theme.spacing(2)});
  height: min-content;
`;

const StyledBoardContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const RecordBoard = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const boardRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-record-board-${recordBoardId}`}
      >
        <RecordBoardStickyHeaderEffect />
        <RecordBoardScrollToFocusedCardEffect />
        <RecordBoardDeactivateBoardCardEffect />
        <RecordBoardQueryEffect />
        <RecordBoardSelectRecordsEffect />
        <StyledContainerContainer>
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
      <RecordBoardClickOutsideEffect />
    </>
  );
};
