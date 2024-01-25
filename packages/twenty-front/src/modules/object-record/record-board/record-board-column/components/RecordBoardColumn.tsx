import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { RecordBoardColumnContext } from '@/object-record/record-board/contexts/RecordBoardColumnContext';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardColumnCardsContainer } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsContainer';
import { RecordBoardColumnHeader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeader';
import { BoardCardIdContext } from '@/object-record/record-board-deprecated/contexts/BoardCardIdContext';

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
};

export const RecordBoardColumn = ({
  recordBoardColumnId,
}: RecordBoardColumnProps) => {
  const {
    isColumnFirstFamilyState,
    isColumnLastFamilyState,
    columnsFamilySelector,
  } = useRecordBoardStates();
  const columnDefinition = useRecoilValue(
    columnsFamilySelector(recordBoardColumnId),
  );

  const isColumnFirst = useRecoilValue(
    isColumnFirstFamilyState(recordBoardColumnId),
  );

  const isColumnLast = useRecoilValue(
    isColumnLastFamilyState(recordBoardColumnId),
  );

  if (!columnDefinition) {
    return null;
  }

  return (
    <RecordBoardColumnContext.Provider
      value={{
        columnDefinition: columnDefinition,
        isColumnFirst: isColumnFirst,
        isColumnLast: isColumnLast,
      }}
    >
      <Droppable droppableId={recordBoardColumnId}>
        {(droppableProvided) => (
          <StyledColumn isFirstColumn={isColumnFirst}>
            <RecordBoardColumnHeader />
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
