import styled from '@emotion/styled';
// Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useContext, useRef } from 'react';

import { RecordBoardClickOutsideEffect } from '@/object-record/record-board/components/RecordBoardClickOutsideEffect';
import { RecordBoardColumns } from '@/object-record/record-board/components/RecordBoardColumns';
import { RecordBoardDragDropContext } from '@/object-record/record-board/components/RecordBoardDragDropContext';
import { RecordBoardDragSelect } from '@/object-record/record-board/components/RecordBoardDragSelect';
import { RecordBoardHeader } from '@/object-record/record-board/components/RecordBoardHeader';
import { RecordBoardScrollToFocusedCardEffect } from '@/object-record/record-board/components/RecordBoardScrollToFocusedCardEffect';
import { RecordBoardStickyHeaderEffect } from '@/object-record/record-board/components/RecordBoardStickyHeaderEffect';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardDeactivateBoardCardEffect } from '@/object-record/record-board/record-board-card/components/RecordBoardDeactivateBoardCardEffect';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  min-height: 100%;
  position: relative;
`;

const StyledColumnContainer = styled.div`
  display: flex;

  & > *:not(:first-of-type) {
    border-left: 1px solid ${({ theme }) => theme.border.color.light};
  }
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
    <RecordBoardComponentInstanceContext.Provider
      value={{ instanceId: recordBoardId }}
    >
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-record-board-${recordBoardId}`}
      >
        <RecordBoardStickyHeaderEffect />
        <RecordBoardScrollToFocusedCardEffect />
        <RecordBoardDeactivateBoardCardEffect />
        <StyledContainerContainer>
          <RecordBoardHeader />
          <StyledBoardContentContainer>
            <StyledContainer ref={boardRef}>
              <RecordBoardDragDropContext>
                <StyledColumnContainer>
                  <RecordBoardColumns />
                </StyledColumnContainer>
              </RecordBoardDragDropContext>
              <RecordBoardDragSelect boardRef={boardRef} />
            </StyledContainer>
          </StyledBoardContentContainer>
        </StyledContainerContainer>
      </ScrollWrapper>
      <RecordBoardClickOutsideEffect />
    </RecordBoardComponentInstanceContext.Provider>
  );
};
