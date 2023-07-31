import { useEffect } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { Draggable, Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { BoardPipelineStageColumn } from '@/ui/board/components/Board';
import { BoardColumn } from '@/ui/board/components/BoardColumn';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useUpdatePipelineStageMutation } from '~/generated/graphql';

import { GET_PIPELINES } from '../queries';
import { BoardCardContext } from '../states/BoardCardContext';
import { BoardColumnContext } from '../states/BoardColumnContext';
import { boardColumnTotalsFamilySelector } from '../states/boardColumnTotalsFamilySelector';
import { pipelineStageIdScopedState } from '../states/pipelineStageIdScopedState';
import { BoardOptions } from '../types/BoardOptions';

import { EntityBoardCard } from './EntityBoardCard';

const StyledPlaceholder = styled.div`
  min-height: 1px;
`;

const StyledNewCardButtonContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledColumnCardsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const BoardColumnCardsContainer = ({
  children,
  droppableProvided,
}: {
  children: React.ReactNode;
  droppableProvided: DroppableProvided;
}) => {
  return (
    <StyledColumnCardsContainer
      ref={droppableProvided?.innerRef}
      {...droppableProvided?.droppableProps}
    >
      {children}
      <StyledPlaceholder>{droppableProvided?.placeholder}</StyledPlaceholder>
    </StyledColumnCardsContainer>
  );
};

export function EntityBoardColumn({
  column,
  boardOptions,
}: {
  column: BoardPipelineStageColumn;
  boardOptions: BoardOptions;
}) {
  const [pipelineStageId, setPipelineStageId] = useRecoilScopedState(
    pipelineStageIdScopedState,
    BoardColumnContext,
  );
  const boardColumnTotal = useRecoilValue(
    boardColumnTotalsFamilySelector(column.pipelineStageId),
  );

  useEffect(() => {
    if (pipelineStageId !== column.pipelineStageId) {
      setPipelineStageId(column.pipelineStageId);
    }
  }, [column, setPipelineStageId, pipelineStageId]);

  const [updatePipelineStage] = useUpdatePipelineStageMutation();
  function handleEditColumnTitle(value: string) {
    updatePipelineStage({
      variables: {
        id: pipelineStageId,
        data: { name: value },
      },
      refetchQueries: [getOperationName(GET_PIPELINES) || ''],
    });
  }

  function handleEditColumnColor(value: string) {
    updatePipelineStage({
      variables: {
        id: pipelineStageId,
        data: { color: value },
      },
      refetchQueries: [getOperationName(GET_PIPELINES) || ''],
    });
  }

  return (
    <Droppable droppableId={column.pipelineStageId}>
      {(droppableProvided) => (
        <BoardColumn
          onColumnColorEdit={handleEditColumnColor}
          onTitleEdit={handleEditColumnTitle}
          title={column.title}
          color={column.colorCode}
          pipelineStageId={column.pipelineStageId}
          totalAmount={boardColumnTotal}
          isFirstColumn={column.index === 0}
        >
          <BoardColumnCardsContainer droppableProvided={droppableProvided}>
            {column.pipelineProgressIds.map((pipelineProgressId, index) => (
              <RecoilScope
                SpecificContext={BoardCardContext}
                key={pipelineProgressId}
              >
                <EntityBoardCard
                  index={index}
                  pipelineProgressId={pipelineProgressId}
                  boardOptions={boardOptions}
                />
              </RecoilScope>
            ))}
            <Draggable
              draggableId={`new-${column.pipelineStageId}`}
              index={column.pipelineProgressIds.length}
            >
              {(draggableProvided) => (
                <div
                  ref={draggableProvided?.innerRef}
                  {...{
                    ...draggableProvided.dragHandleProps,
                    draggable: false,
                  }}
                  {...draggableProvided?.draggableProps}
                >
                  <StyledNewCardButtonContainer>
                    <RecoilScope>{boardOptions.newCardComponent}</RecoilScope>
                  </StyledNewCardButtonContainer>
                </div>
              )}
            </Draggable>
          </BoardColumnCardsContainer>
        </BoardColumn>
      )}
    </Droppable>
  );
}
