import { useCallback, useRef } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useRecoilState } from 'recoil';

import { CompanyBoardRecoilScopeContext } from '@/companies/states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';
import { GET_PIPELINE_PROGRESS } from '@/pipeline/graphql/queries/getPipelineProgress';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { BoardHeader } from '@/ui/board/components/BoardHeader';
import { StyledBoard } from '@/ui/board/components/StyledBoard';
import { BoardColumnIdContext } from '@/ui/board/contexts/BoardColumnIdContext';
import { SelectedSortType } from '@/ui/filter-n-sort/types/interface';
import { IconList } from '@/ui/icon';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutsideByClassName } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import {
  PipelineProgress,
  PipelineProgressOrderByWithRelationInput,
  PipelineStage,
  useUpdateOnePipelineProgressStageMutation,
} from '~/generated/graphql';

import { useCurrentCardSelected } from '../hooks/useCurrentCardSelected';
import { useSetCardSelected } from '../hooks/useSetCardSelected';
import { useUpdateBoardCardIds } from '../hooks/useUpdateBoardCardIds';
import { boardColumnsState } from '../states/boardColumnsState';
import { BoardColumnRecoilScopeContext } from '../states/recoil-scope-contexts/BoardColumnRecoilScopeContext';
import { BoardOptions } from '../types/BoardOptions';

import { EntityBoardColumn } from './EntityBoardColumn';

const StyledWrapper = styled.div`
  display: flex;
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
  const setCardSelected = useSetCardSelected();

  const theme = useTheme();
  const [updatePipelineProgressStage] =
    useUpdateOnePipelineProgressStageMutation();

  const { unselectAllActiveCards } = useCurrentCardSelected();

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

  useListenClickOutsideByClassName({
    classNames: ['entity-board-card'],
    excludeClassNames: ['action-bar'],
    callback: unselectAllActiveCards,
  });

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

  const boardRef = useRef<HTMLDivElement>(null);

  useScopedHotkeys(
    'escape',
    unselectAllActiveCards,
    PageHotkeyScope.OpportunitiesPage,
  );

  return (boardColumns?.length ?? 0) > 0 ? (
    <StyledWrapper>
      <BoardHeader
        viewName="All opportunities"
        viewIcon={<IconList size={theme.icon.size.md} />}
        availableSorts={boardOptions.sorts}
        onSortsUpdate={updateSorts}
        context={CompanyBoardRecoilScopeContext}
      />
      <ScrollWrapper>
        <StyledBoard ref={boardRef}>
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
      </ScrollWrapper>
      <DragSelect
        dragSelectable={boardRef}
        onDragSelectionChange={setCardSelected}
      />
    </StyledWrapper>
  ) : (
    <></>
  );
}
