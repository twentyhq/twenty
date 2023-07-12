import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Company, PipelineProgress } from '~/generated/graphql';

import {
  Column,
  getOptimisticlyUpdatedBoard,
  StyledBoard,
} from '../../ui/board/components/Board';
import { boardColumnsState } from '../states/boardColumnsState';
import { boardItemsState } from '../states/boardItemsState';
import { selectedBoardItemsState } from '../states/selectedBoardItemsState';

import { CompanyBoardCard } from './CompanyBoardCard';
import { NewButton } from './NewButton';

export type CompanyProgress = {
  company: Pick<Company, 'id' | 'name' | 'domainName'>;
  pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>;
};

export type CompanyProgressDict = {
  [key: string]: CompanyProgress;
};

type BoardProps = {
  pipelineId: string;
  columns: Omit<Column, 'itemKeys'>[];
  initialBoard: Column[];
  initialItems: CompanyProgressDict;
  onCardMove?: (itemKey: string, columnId: Column['id']) => Promise<void>;
  onCardUpdate: (
    pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>,
  ) => Promise<void>;
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

export function Board({
  columns,
  initialBoard,
  initialItems,
  onCardMove,
  onCardUpdate,
  pipelineId,
}: BoardProps) {
  const [board, setBoard] = useRecoilState(boardColumnsState);
  const [boardItems, setBoardItems] = useRecoilState(boardItemsState);
  const [selectedBoardItems, setSelectedBoardItems] = useRecoilState(
    selectedBoardItemsState,
  );
  const [isInitialBoardLoaded, setIsInitialBoardLoaded] = useState(false);

  useEffect(() => {
    if (!isInitialBoardLoaded) {
      setBoard(initialBoard);
    }
    if (Object.keys(initialItems).length > 0) {
      setBoardItems(initialItems);
      setIsInitialBoardLoaded(true);
    }
  }, [
    initialBoard,
    setBoard,
    initialItems,
    setBoardItems,
    setIsInitialBoardLoaded,
    isInitialBoardLoaded,
  ]);

  const calculateColumnTotals = (
    columns: Column[],
    items: {
      [key: string]: CompanyProgress;
    },
  ): { [key: string]: number } => {
    return columns.reduce<{ [key: string]: number }>((acc, column) => {
      acc[column.id] = column.itemKeys.reduce(
        (total: number, itemKey: string) => {
          return total + (items[itemKey]?.pipelineProgress?.amount || 0);
        },
        0,
      );
      return acc;
    }, {});
  };

  const columnTotals = useMemo(
    () => calculateColumnTotals(board, boardItems),
    [board, boardItems],
  );

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
          onCardMove &&
          (await onCardMove(draggedEntityId, destinationColumnId));
      } catch (e) {
        console.error(e);
      }
    },
    [board, onCardMove, setBoard],
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
                amount={columnTotals[column.id]}
                colorCode={column.colorCode}
              >
                <BoardColumnCardsContainer
                  droppableProvided={droppableProvided}
                >
                  {board[columnIndex].itemKeys.map(
                    (itemKey, index) =>
                      boardItems[itemKey] && (
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
                              <CompanyBoardCard
                                company={boardItems[itemKey].company}
                                pipelineProgress={
                                  boardItems[itemKey].pipelineProgress
                                }
                                selected={selectedBoardItems.includes(itemKey)}
                                onCardUpdate={onCardUpdate}
                                onSelect={() => handleSelect(itemKey)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ),
                  )}
                </BoardColumnCardsContainer>
                <NewButton pipelineId={pipelineId} columnId={column.id} />
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
