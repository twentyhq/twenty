import { useCallback, useEffect, useMemo, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DroppableProvided,
  OnDragEndResponder,
} from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useRecoilState } from 'recoil';

import { BoardColumn } from '@/ui/board/components/BoardColumn';
import {
  Pipeline,
  PipelineProgress,
  PipelineStage,
  useUpdateOnePipelineProgressMutation,
  useUpdateOnePipelineProgressStageMutation,
} from '~/generated/graphql';

import {
  Column,
  getOptimisticlyUpdatedBoard,
  StyledBoard,
} from '../../ui/board/components/Board';
import { GET_PIPELINES } from '../queries';
import { boardColumnsState } from '../states/boardColumnsState';
import { selectedBoardItemsState } from '../states/selectedBoardItemsState';

export type EntityProgress = {
  entity: any;
  pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>;
};

export type EntityProgressDict = {
  [key: string]: EntityProgress;
};

const StyledPlaceholder = styled.div`
  min-height: 1px;
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

export function EntityProgressBoard() {
  const [isInitialBoardLoaded, setIsInitialBoardLoaded] = useState(false);
  const columns = useMemo(
    () =>
      initialBoard?.map(({ id, colorCode, title }) => ({
        id,
        colorCode,
        title,
      })),
    [initialBoard],
  );
  const [updatePipelineProgress] = useUpdateOnePipelineProgressMutation();
  const [updatePipelineProgressStage] =
    useUpdateOnePipelineProgressStageMutation();

  const handleCardUpdate = useCallback(
    async (
      pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>,
    ) => {
      await updatePipelineProgress({
        variables: {
          id: pipelineProgress.id,
          amount: pipelineProgress.amount,
          closeDate: pipelineProgress.closeDate || null,
        },
        refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
      });
    },
    [updatePipelineProgress],
  );

  const handleCardMove = useCallback(
    async (
      pipelineProgressId: NonNullable<PipelineProgress['id']>,
      pipelineStageId: NonNullable<PipelineStage['id']>,
    ) => {
      updatePipelineProgressStage({
        variables: {
          id: pipelineProgressId,
          pipelineStageId,
        },
      });
    },
    [updatePipelineProgressStage],
  );

  useEffect(() => {
    if (!isInitialBoardLoaded) {
      setIsInitialBoardLoaded(true);
      setBoard(initialBoard);
    }
  }, [initialBoard, setBoard, setIsInitialBoardLoaded, isInitialBoardLoaded]);

  const onDragEnd: OnDragEndResponder = useCallback(
    async (result) => {
      const newBoard = getOptimisticlyUpdatedBoard(board, result);
      if (!newBoard) return;
      setBoard(newBoard);
      try {
        const draggedEntityId = result.draggableId;
        const destinationColumnId = result.destination?.droppableId;
        draggedEntityId &&
          destinationColumnId &&
          handleCardMove &&
          (await handleCardMove(draggedEntityId, destinationColumnId));
      } catch (e) {
        console.error(e);
      }
    },
    [board, handleCardMove, setBoard],
  );

  function handleSelect(itemKey: string) {
    if (selectedBoardItems.includes(itemKey)) {
      setSelectedBoardItems(
        selectedBoardItems.filter((key) => key !== itemKey),
      );
    } else {
      setSelectedBoardItems([...selectedBoardItems, itemKey]);
    }
  }

  return board.length > 0 ? (
    <StyledBoard>
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((column, columnIndex) => (
          <Droppable key={column.id} droppableId={column.id}>
            {(droppableProvided) => (
              <BoardColumn
                title={`${column.title}  `}
                colorCode={column.colorCode}
              >
                <BoardColumnCardsContainer
                  droppableProvided={droppableProvided}
                >
                  {board[columnIndex].itemKeys.map((itemKey, index) => (
                    <Draggable
                      key={itemKey}
                      draggableId={itemKey}
                      index={index}
                    >
                      {(draggableProvided) => (
                        <div
                          ref={draggableProvided?.innerRef}
                          {...draggableProvided?.dragHandleProps}
                          {...draggableProvided?.draggableProps}
                        >
                          {renderEntityCard(
                            itemKey,
                            handleSelect,
                            handleCardUpdate,
                            selectedBoardItems.includes(itemKey),
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                </BoardColumnCardsContainer>
                {renderNewEntityButton(pipeline?.id || '', column.id)}
              </BoardColumn>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </StyledBoard>
  ) : (
    <></>
  );
}
