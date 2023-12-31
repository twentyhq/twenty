import { useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordBoardActionBar } from '@/object-record/record-board/action-bar/components/RecordBoardActionBar';
import { RecordBoardInternalEffect } from '@/object-record/record-board/components/RecordBoardInternalEffect';
import { RecordBoardContextMenu } from '@/object-record/record-board/context-menu/components/RecordBoardContextMenu';
import { useRecordBoardScopedStates } from '@/object-record/record-board/hooks/internal/useRecordBoardScopedStates';
import { useSetRecordBoardCardSelectedInternal } from '@/object-record/record-board/hooks/internal/useSetRecordBoardCardSelectedInternal';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutsideByClassName } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { logError } from '~/utils/logError';

import { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptions } from '../types/BoardOptions';

import { RecordBoardColumn } from './RecordBoardColumn';

export type RecordBoardProps = {
  recordBoardId: string;
  boardOptions: BoardOptions;
  onColumnAdd?: (boardColumn: BoardColumnDefinition) => void;
  onColumnDelete?: (boardColumnId: string) => void;
  onEditColumnTitle: (params: {
    columnId: string;
    title: string;
    color: string;
  }) => void;
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
  recordBoardId,
  boardOptions,
  onColumnDelete,
  onEditColumnTitle,
}: RecordBoardProps) => {
  const recordBoardScopeId = recordBoardId;

  const { boardColumnsState } = useRecordBoardScopedStates({
    recordBoardScopeId,
  });
  const boardColumns = useRecoilValue(boardColumnsState);

  const { updateOneRecord: updateOneOpportunity } =
    useUpdateOneRecord<Opportunity>({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
    });

  const { unselectAllActiveCards, setCardSelected } =
    useSetRecordBoardCardSelectedInternal({ recordBoardScopeId });

  const updatePipelineProgressStageInDB = useCallback(
    async (pipelineProgressId: string, pipelineStepId: string) => {
      await updateOneOpportunity?.({
        idToUpdate: pipelineProgressId,
        updateOneRecordInput: {
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

  const onDragEnd: OnDragEndResponder = useCallback(
    async (result) => {
      if (!boardColumns) return;

      try {
        const draggedEntityId = result.draggableId;
        const destinationColumnId = result.destination?.droppableId;

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
    [boardColumns, updatePipelineProgressStageInDB],
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
    <RecordBoardScope recordBoardScopeId={recordBoardId}>
      <RecordBoardContextMenu />
      <RecordBoardActionBar />
      <RecordBoardInternalEffect />

      <StyledWrapper>
        <StyledBoardHeader />
        <ScrollWrapper>
          <StyledBoard ref={boardRef}>
            <DragDropContext onDragEnd={onDragEnd}>
              {sortedBoardColumns.map((column) => (
                <RecordBoardColumn
                  key={column.id}
                  recordBoardColumnId={column.id}
                  columnDefinition={column}
                  recordBoardColumnTotal={sortedBoardColumns.length}
                  recordBoardOptions={boardOptions}
                  onDelete={onColumnDelete}
                  onTitleEdit={onEditColumnTitle}
                />
              ))}
            </DragDropContext>
          </StyledBoard>
        </ScrollWrapper>
        <DragSelect
          dragSelectable={boardRef}
          onDragSelectionChange={setCardSelected}
        />
      </StyledWrapper>
    </RecordBoardScope>
  );
};
