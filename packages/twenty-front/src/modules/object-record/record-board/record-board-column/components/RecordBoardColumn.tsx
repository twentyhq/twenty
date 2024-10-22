import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardColumnCardsContainer } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsContainer';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';

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

  padding-top: 0px;

  position: relative;

  min-height: 100%;
`;

type RecordBoardColumnProps = {
  recordBoardColumnId: string;
};

export const RecordBoardColumn = ({
  recordBoardColumnId,
}: RecordBoardColumnProps) => {
  const {
    isFirstColumnFamilyState,
    isLastColumnFamilyState,
    columnsFamilySelector,
    recordIdsByColumnIdFamilyState,
  } = useRecordBoardStates();
  const columnDefinition = useRecoilValue(
    columnsFamilySelector(recordBoardColumnId),
  );

  const isFirstColumn = useRecoilValue(
    isFirstColumnFamilyState(recordBoardColumnId),
  );

  const isLastColumn = useRecoilValue(
    isLastColumnFamilyState(recordBoardColumnId),
  );

  const recordIds = useRecoilValue(
    recordIdsByColumnIdFamilyState(recordBoardColumnId),
  );

  if (!columnDefinition) {
    return null;
  }

  return (
    <RecordBoardColumnContext.Provider
      value={{
        columnDefinition: columnDefinition,
        isFirstColumn: isFirstColumn,
        isLastColumn: isLastColumn,
        recordCount: recordIds.length,
        columnId: recordBoardColumnId,
        recordIds,
      }}
    >
      <Droppable droppableId={recordBoardColumnId}>
        {(droppableProvided) => (
          <StyledColumn isFirstColumn={isFirstColumn}>
            <RecordBoardColumnCardsContainer
              droppableProvided={droppableProvided}
              recordIds={recordIds}
            />
          </StyledColumn>
        )}
      </Droppable>
    </RecordBoardColumnContext.Provider>
  );
};
