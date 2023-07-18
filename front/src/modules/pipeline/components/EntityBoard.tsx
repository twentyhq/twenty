import { useCallback } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { IconList } from '@tabler/icons-react';
import { useRecoilState } from 'recoil';

import { CompanyBoardContext } from '@/companies/states/CompanyBoardContext';
import { BoardHeader } from '@/ui/board/components/BoardHeader';
import { SelectedSortType } from '@/ui/filter-n-sort/types/interface';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import {
  PipelineProgress,
  PipelineProgressOrderByWithRelationInput,
  PipelineStage,
  useUpdateOnePipelineProgressStageMutation,
} from '~/generated/graphql';

import {
  getOptimisticlyUpdatedBoard,
  StyledBoard,
} from '../../ui/board/components/Board';
import { GET_PIPELINE_PROGRESS } from '../queries';
import { BoardColumnContext } from '../states/BoardColumnContext';
import { boardState } from '../states/boardState';
import { BoardOptions } from '../types/BoardOptions';

import { EntityBoardColumn } from './EntityBoardColumn';

const StyledBoardWithHeader = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
`;

export function EntityBoard({
  boardOptions,
  updateSorts,
}: {
  boardOptions: BoardOptions;
  updateSorts: (
    sorts: Array<SelectedSortType<PipelineProgressOrderByWithRelationInput>>,
  ) => void;
}) {
  const [board, setBoard] = useRecoilState(boardState);
  const theme = useTheme();
  const [updatePipelineProgressStage] =
    useUpdateOnePipelineProgressStageMutation();

  const updatePipelineProgressStageInDB = useCallback(
    async (
      pipelineProgressId: NonNullable<PipelineProgress['id']>,
      pipelineStageId: NonNullable<PipelineStage['id']>,
    ) => {
      updatePipelineProgressStage({
        variables: {
          id: pipelineProgressId,
          pipelineStageId,
        },
        refetchQueries: [getOperationName(GET_PIPELINE_PROGRESS) ?? ''],
      });
    },
    [updatePipelineProgressStage],
  );

  const onDragEnd: OnDragEndResponder = useCallback(
    async (result) => {
      if (!board) return;
      const newBoard = getOptimisticlyUpdatedBoard(board, result);
      if (!newBoard) return;
      setBoard(newBoard);
      try {
        const draggedEntityId = result.draggableId;
        const destinationColumnId = result.destination?.droppableId;
        draggedEntityId &&
          destinationColumnId &&
          updatePipelineProgressStageInDB &&
          (await updatePipelineProgressStageInDB(
            draggedEntityId,
            destinationColumnId,
          ));
      } catch (e) {
        console.error(e);
      }
    },
    [board, updatePipelineProgressStageInDB, setBoard],
  );

  const sortedBoard = board
    ? [...board].sort((a, b) => {
        return a.index - b.index;
      })
    : [];

  return (board?.length ?? 0) > 0 ? (
    <StyledBoardWithHeader>
      <BoardHeader
        viewName="All opportunities"
        viewIcon={<IconList size={theme.icon.size.md} />}
        availableSorts={boardOptions.sorts}
        onSortsUpdate={updateSorts}
        context={CompanyBoardContext}
      />
      <StyledBoard>
        <DragDropContext onDragEnd={onDragEnd}>
          {sortedBoard.map((column) => (
            <RecoilScope
              SpecificContext={BoardColumnContext}
              key={column.pipelineStageId}
            >
              <EntityBoardColumn boardOptions={boardOptions} column={column} />
            </RecoilScope>
          ))}
        </DragDropContext>
      </StyledBoard>
    </StyledBoardWithHeader>
  ) : (
    <></>
  );
}
