import { useEffect } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { BoardCardContext } from '@/pipeline-progress/states/BoardCardContext';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { BoardPipelineStageColumn } from '@/ui/board/components/Board';
import { BoardColumn } from '@/ui/board/components/BoardColumn';
import { useUpdatePipelineStageMutation } from '~/generated/graphql';

import { GET_PIPELINES } from '../services';
import { BoardColumnContext } from '../states/BoardColumnContext';
import { boardColumnTotalsFamilySelector } from '../states/boardColumnTotalsFamilySelector';
import { pipelineStageIdScopedState } from '../states/pipelineStageIdScopedState';
import { BoardOptions } from '../types/BoardOptions';

import { EntityBoardCard } from './EntityBoardCard';

const StyledPlaceholder = styled.div`
  min-height: 1px;
`;

const StyledNewCardButtonContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(40)};
`;

const BoardColumnCardsContainer = ({
  children,
  droppableProvided,
}: {
  children: React.ReactNode;
  droppableProvided: DroppableProvided;
}) => {
  return (
    <div
      ref={droppableProvided?.innerRef}
      {...droppableProvided?.droppableProps}
    >
      {children}
      <StyledPlaceholder>{droppableProvided?.placeholder}</StyledPlaceholder>
    </div>
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
        name: value,
      },
      refetchQueries: [getOperationName(GET_PIPELINES) || ''],
    });
  }

  return (
    <Droppable droppableId={column.pipelineStageId}>
      {(droppableProvided) => (
        <BoardColumn
          onTitleEdit={handleEditColumnTitle}
          title={column.title}
          colorCode={column.colorCode}
          pipelineStageId={column.pipelineStageId}
          totalAmount={boardColumnTotal}
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
          </BoardColumnCardsContainer>
          <StyledNewCardButtonContainer>
            <RecoilScope>{boardOptions.newCardComponent}</RecoilScope>
          </StyledNewCardButtonContainer>
        </BoardColumn>
      )}
    </Droppable>
  );
}
