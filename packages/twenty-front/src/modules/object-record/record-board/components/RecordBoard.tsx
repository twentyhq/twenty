import styled from '@emotion/styled';

import { useContext, useRef } from 'react';

import { RecordBoardColumns } from '@/object-record/record-board/components/RecordBoardColumns';
import { RecordBoardDragDropContext } from '@/object-record/record-board/components/RecordBoardDragDropContext';
import { RecordBoardDragSelect } from '@/object-record/record-board/components/RecordBoardDragSelect';
import { RecordBoardEffects } from '@/object-record/record-board/components/RecordBoardEffects';
import { RecordBoardFetchMoreInViewTriggerComponent } from '@/object-record/record-board/components/RecordBoardFetchMoreInViewTriggerComponent';
import { RecordBoardHeader } from '@/object-record/record-board/components/RecordBoardHeader';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
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
        <RecordBoardEffects />
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
    </>
  );
};
