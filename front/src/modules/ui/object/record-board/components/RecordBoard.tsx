import { useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useRecoilValue } from 'recoil';

import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { BoardColumnContext } from '@/ui/object/record-board/contexts/BoardColumnContext';
import { useSetCardSelected } from '@/ui/object/record-board/hooks/useSetCardSelected';
import { useUpdateBoardCardIds } from '@/ui/object/record-board/hooks/useUpdateBoardCardIds';
import { boardColumnsState } from '@/ui/object/record-board/states/boardColumnsState';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutsideByClassName } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { logError } from '~/utils/logError';

import { BoardColumnRecoilScopeContext } from '../states/recoil-scope-contexts/BoardColumnRecoilScopeContext';
import { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptions } from '../types/BoardOptions';

import { RecordBoardColumn } from './RecordBoardColumn';

export type RecordBoardProps = {
  boardOptions: BoardOptions;
  onColumnAdd?: (boardColumn: BoardColumnDefinition) => void;
  onColumnDelete?: (boardColumnId: string) => void;
  onEditColumnTitle: (columnId: string, title: string, color: string) => void;
};

const StyledBoard = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex: 1;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(2)};
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

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

export const RecordBoard = ({
  boardOptions,
  onColumnDelete,
  onEditColumnTitle,
}: RecordBoardProps) => {
  const boardColumns = useRecoilValue(boardColumnsState);

  const { updateOneObject: updateOneOpportunity } =
    useUpdateOneObjectRecord<Opportunity>({
      objectNameSingular: 'opportunity',
    });

  const { unselectAllActiveCards, setCardSelected } = useSetCardSelected();

  const updatePipelineProgressStageInDB = useCallback(
    async (pipelineProgressId: string, pipelineStepId: string) => {
      await updateOneOpportunity?.({
        idToUpdate: pipelineProgressId,
        input: {
          pipelineStepId: pipelineStepId,
        },
      });
    },
    [updateOneOpportunity],
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

  return (
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
                  <RecordBoardColumn
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
  );
};
