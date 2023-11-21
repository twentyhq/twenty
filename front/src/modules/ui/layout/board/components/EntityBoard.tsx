import { useCallback, useRef } from 'react';
import { useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useRecoilValue } from 'recoil';

import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { StyledBoard } from '@/ui/layout/board/components/StyledBoard';
import { BoardColumnContext } from '@/ui/layout/board/contexts/BoardColumnContext';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutsideByClassName } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { logError } from '~/utils/logError';

import { useCurrentCardSelected } from '../hooks/useCurrentCardSelected';
import { useSetCardSelected } from '../hooks/useSetCardSelected';
import { useUpdateBoardCardIds } from '../hooks/useUpdateBoardCardIds';
import { boardColumnsState } from '../states/boardColumnsState';
import { BoardColumnRecoilScopeContext } from '../states/recoil-scope-contexts/BoardColumnRecoilScopeContext';
import { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptions } from '../types/BoardOptions';

import { EntityBoardColumn } from './EntityBoardColumn';

export type EntityBoardProps = {
  boardOptions: BoardOptions;
  onColumnAdd?: (boardColumn: BoardColumnDefinition) => void;
  onColumnDelete?: (boardColumnId: string) => void;
  onEditColumnTitle: (columnId: string, title: string, color: string) => void;
};

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledBoardHeader = styled.div`
  position: relative;
  z-index: 1;
`;

export const EntityBoard = ({
  boardOptions,
  onColumnDelete,
  onEditColumnTitle,
}: EntityBoardProps) => {
  const boardColumns = useRecoilValue(boardColumnsState);
  const setCardSelected = useSetCardSelected();

  const { updateOneObject: updateOneOpportunity } =
    useUpdateOneObjectRecord<Opportunity>({
      objectNameSingular: 'opportunity',
    });

  const apolloClient = useApolloClient();

  const { unselectAllActiveCards } = useCurrentCardSelected();

  const updatePipelineProgressStageInDB = useCallback(
    async (pipelineProgressId: string, pipelineStepId: string) => {
      await updateOneOpportunity?.({
        idToUpdate: pipelineProgressId,
        input: {
          pipelineStepId: pipelineStepId,
        },
      });

      const cache = apolloClient.cache;
      cache.modify({
        id: cache.identify({
          id: pipelineProgressId,
          __typename: 'PipelineProgress',
        }),
        fields: {
          pipelineStepId: () => pipelineStepId,
        },
      });
    },
    [apolloClient.cache, updateOneOpportunity],
  );

  useListenClickOutsideByClassName({
    classNames: ['entity-board-card'],
    excludeClassNames: ['action-bar', 'context-menu'],
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
        logError(e);
      }
    },
    [boardColumns, updatePipelineProgressStageInDB, updateBoardCardIds],
  );

  const sortedBoardColumns = [...boardColumns].sort((a, b) => {
    return a.position - b.position;
  });

  const boardRef = useRef<HTMLDivElement>(null);

  useScopedHotkeys(
    'escape',
    unselectAllActiveCards,
    PageHotkeyScope.OpportunitiesPage,
  );

  return (boardColumns?.length ?? 0) > 0 ? (
    <StyledWrapper>
      <StyledBoardHeader />
      <ScrollWrapper>
        <StyledBoard ref={boardRef}>
          <DragDropContext onDragEnd={onDragEnd}>
            {sortedBoardColumns.map((column) => (
              <BoardColumnContext.Provider
                key={column.id}
                value={{
                  id: column.id,
                  columnDefinition: column,
                  isFirstColumn: column.position === 0,
                  isLastColumn:
                    column.position === sortedBoardColumns.length - 1,
                }}
              >
                <RecoilScope
                  CustomRecoilScopeContext={BoardColumnRecoilScopeContext}
                  key={column.id}
                >
                  <EntityBoardColumn
                    boardOptions={boardOptions}
                    onDelete={onColumnDelete}
                    onTitleEdit={onEditColumnTitle}
                  />
                </RecoilScope>
              </BoardColumnContext.Provider>
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
};
