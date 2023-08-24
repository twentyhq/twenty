import { useCallback, useRef } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { IconList } from '@tabler/icons-react';
import { useRecoilState } from 'recoil';

import { CompanyBoardRecoilScopeContext } from '@/companies/states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';
import { GET_PIPELINE_PROGRESS } from '@/pipeline/graphql/queries/getPipelineProgress';
import { BoardHeader } from '@/ui/board/components/BoardHeader';
import { StyledBoard } from '@/ui/board/components/StyledBoard';
import { BoardColumnIdContext } from '@/ui/board/contexts/BoardColumnIdContext';
import { SelectedSortType } from '@/ui/filter-n-sort/types/interface';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { StyledScrollWrapper } from '@/ui/utilities/scroll/components/StyledScrollSibling';
import { useListenScroll } from '@/ui/utilities/scroll/hooks/useListenScroll';
import {
  PipelineProgress,
  PipelineProgressOrderByWithRelationInput,
  PipelineStage,
  useUpdateOnePipelineProgressStageMutation,
} from '~/generated/graphql';

import { useSetCardSelected } from '../hooks/useSetCardSelected';
import { useUpdateBoardCardIds } from '../hooks/useUpdateBoardCardIds';
import { boardColumnsState } from '../states/boardColumnsState';
import { BoardColumnRecoilScopeContext } from '../states/recoil-scope-contexts/BoardColumnRecoilScopeContext';
import { BoardOptions } from '../types/BoardOptions';

import { EntityBoardColumn } from './EntityBoardColumn';

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
  const setCardSelected = useSetCardSelected();

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

  const scrollableRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useListenScroll({
    scrollableRef,
  });

  return (boardColumns?.length ?? 0) > 0 ? (
    <StyledScrollWrapper ref={scrollableRef}>
      <BoardHeader
        viewName="All opportunities"
        viewIcon={<IconList size={theme.icon.size.md} />}
        availableSorts={boardOptions.sorts}
        onSortsUpdate={updateSorts}
        context={CompanyBoardRecoilScopeContext}
      />
      <StyledBoard>
        <DragDropContext onDragEnd={onDragEnd}>
          {sortedBoardColumns.map((column) => (
            <BoardColumnIdContext.Provider value={column.id} key={column.id}>
              <RecoilScope
                SpecificContext={BoardColumnRecoilScopeContext}
                key={column.id}
              >
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
        onDragSelectionChange={setCardSelected}
      />
    </StyledScrollWrapper>
  ) : (
    <></>
  );
}
