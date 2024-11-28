import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';

import { RecordBoardColumnCardsContainer } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsContainer';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexRowIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRowIdsByGroupComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilValue } from 'recoil';

const StyledColumn = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  max-width: 200px;
  min-width: 200px;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-top: 0px;
  position: relative;
  height: 100%;
`;

type RecordBoardColumnProps = {
  recordBoardColumnId: string;
};

export const RecordBoardColumn = ({
  recordBoardColumnId,
}: RecordBoardColumnProps) => {
  const recordGroupDefinition = useRecoilValue(
    recordGroupDefinitionFamilyState(recordBoardColumnId),
  );

  const recordRowIdsByGroup = useRecoilComponentFamilyValueV2(
    recordIndexRowIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );

  if (!recordGroupDefinition) {
    return null;
  }

  return (
    <RecordBoardColumnContext.Provider
      value={{
        columnDefinition: recordGroupDefinition,
        recordCount: recordRowIdsByGroup.length,
        columnId: recordBoardColumnId,
        recordIds: recordRowIdsByGroup,
      }}
    >
      <Droppable droppableId={recordBoardColumnId}>
        {(droppableProvided) => (
          <StyledColumn>
            <RecordBoardColumnCardsContainer
              droppableProvided={droppableProvided}
              recordIds={recordRowIdsByGroup}
            />
          </StyledColumn>
        )}
      </Droppable>
    </RecordBoardColumnContext.Provider>
  );
};
