import { useCallback, useRef } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { IconList } from '@tabler/icons-react';
import { useRecoilState } from 'recoil';

import { CompanyBoardContext } from '@/companies/states/CompanyBoardContext';
import { GET_PIPELINE_PROGRESS } from '@/pipeline/queries';
import { BoardHeader } from '@/ui/board/components/BoardHeader';
import { StyledBoard } from '@/ui/board/components/StyledBoard';
import { useUpdateBoardCardIds } from '@/ui/board/hooks/useUpdateBoardCardIds';
import { BoardColumnIdContext } from '@/ui/board/states/BoardColumnIdContext';
import { SelectedSortType } from '@/ui/filter-n-sort/types/interface';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import {
  PipelineProgress,
  PipelineProgressOrderByWithRelationInput,
  PipelineStage,
  useUpdateOnePipelineProgressStageMutation,
} from '~/generated/graphql';

import { BoardColumnContext } from '../states/BoardColumnContext';
import { boardColumnsState } from '../states/boardColumnsState';
import { selectedBoardCardIdsState } from '../states/selectedBoardCardIdsState';
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
  onEditColumnTitle,
}: {
  boardOptions: BoardOptions;
  updateSorts: (
    sorts: Array<SelectedSortType<PipelineProgressOrderByWithRelationInput>>,
  ) => void;
  onEditColumnTitle: (columnId: string, title: string, color: string) => void;
}) {
  const [boardColumns] = useRecoilState(boardColumnsState);

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

  const updateBoardCardIds = useUpdateBoardCardIds();

  const onDragEnd: OnDragEndResponder = useCallback(
    async (result) => {
      if (!boardColumns) return;

      updateBoardCardIds(result);

      try {
        const draggedEntityId = result.draggableId;
        const destinationColumnId = result.destination?.droppableId;

        // TODO: abstract
        if (
          draggedEntityId &&
          destinationColumnId &&
          updatePipelineProgressStageInDB
        ) {
          await updatePipelineProgressStageInDB(
            draggedEntityId,
            destinationColumnId,
          );
        }
      } catch (e) {
        console.error(e);
      }
    },
    [boardColumns, updatePipelineProgressStageInDB, updateBoardCardIds],
  );

  const sortedBoardColumns = [...boardColumns].sort((a, b) => {
    return a.index - b.index;
  });

  const boardRef = useRef(null);
  const [selectedBoardCards, setSelectedBoardCards] = useRecoilState(
    selectedBoardCardIdsState,
  );

  function setRowSelectedState(boardCardId: string, selected: boolean) {
    if (selected && !selectedBoardCards.includes(boardCardId)) {
      setSelectedBoardCards([...selectedBoardCards, boardCardId ?? '']);
    } else if (!selected && selectedBoardCards.includes(boardCardId)) {
      setSelectedBoardCards(
        selectedBoardCards.filter((id) => id !== boardCardId),
      );
    }
  }

  return (boardColumns?.length ?? 0) > 0 ? (
    <StyledBoardWithHeader>
      <BoardHeader
        viewName="All opportunities"
        viewIcon={<IconList size={theme.icon.size.md} />}
        availableSorts={boardOptions.sorts}
        onSortsUpdate={updateSorts}
        context={CompanyBoardContext}
      />
      <StyledBoard ref={boardRef}>
        <DragDropContext onDragEnd={onDragEnd}>
          {sortedBoardColumns.map((column) => (
            <BoardColumnIdContext.Provider value={column.id} key={column.id}>
              <RecoilScope SpecificContext={BoardColumnContext} key={column.id}>
                <EntityBoardColumn
                  boardOptions={boardOptions}
                  column={column}
                  onEditColumnTitle={onEditColumnTitle}
                />
              </RecoilScope>
            </BoardColumnIdContext.Provider>
          ))}
        </DragDropContext>
      </StyledBoard>
      <DragSelect
        dragSelectable={boardRef}
        onDragSelectionChange={setRowSelectedState}
      />
    </StyledBoardWithHeader>
  ) : (
    <></>
  );
}
