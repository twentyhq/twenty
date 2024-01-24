import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';

import { RecordBoardColumnContext } from '@/object-record/record-board/contexts/RecordBoardColumnContext';
import { RecordBoardColumnCardsContainer } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsContainer';
import { BoardCardIdContext } from '@/object-record/record-board-deprecated/contexts/BoardCardIdContext';
import { BoardColumnDefinition } from '@/object-record/record-board-deprecated/types/BoardColumnDefinition';

const StyledColumn = styled.div<{ isFirstColumn: boolean }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-left: 1px solid
    ${({ theme, isFirstColumn }) =>
      isFirstColumn ? 'none' : theme.border.color.light};
  display: flex;
  flex-direction: column;
  max-width: 200px;
  min-width: 200px;

  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

type RecordBoardColumnProps = {
  recordBoardColumnId: string;
  columnDefinition: BoardColumnDefinition;
};

export const RecordBoardColumn = ({
  recordBoardColumnId,
  columnDefinition,
}: RecordBoardColumnProps) => {
  const isFirstColumn = columnDefinition.position === 0;

  return (
    <RecordBoardColumnContext.Provider
      value={{
        id: recordBoardColumnId,
        columnDefinition: columnDefinition,
      }}
    >
      <Droppable droppableId={recordBoardColumnId}>
        {(droppableProvided) => (
          <StyledColumn isFirstColumn={isFirstColumn}>
            <RecordBoardColumnCardsContainer
              droppableProvided={droppableProvided}
            >
              {[].map((cardId, _index) => (
                <BoardCardIdContext.Provider
                  value={cardId}
                  key={cardId}
                ></BoardCardIdContext.Provider>
              ))}
            </RecordBoardColumnCardsContainer>
          </StyledColumn>
        )}
      </Droppable>
    </RecordBoardColumnContext.Provider>
  );
};
