import { useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordBoardDeprecatedActionBar } from '@/object-record/record-board-deprecated/action-bar/components/RecordBoardDeprecatedActionBar';
import { RecordBoardDeprecatedInternalEffect } from '@/object-record/record-board-deprecated/components/RecordBoardDeprecatedInternalEffect';
import { RecordBoardDeprecatedContextMenu } from '@/object-record/record-board-deprecated/context-menu/components/RecordBoardDeprecatedContextMenu';
import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { useSetRecordBoardDeprecatedCardSelectedInternal } from '@/object-record/record-board-deprecated/hooks/internal/useSetRecordBoardDeprecatedCardSelectedInternal';
import { RecordBoardDeprecatedScope } from '@/object-record/record-board-deprecated/scopes/RecordBoardDeprecatedScope';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutsideByClassName } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { logError } from '~/utils/logError';

import { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptions } from '../types/BoardOptions';

import { RecordBoardDeprecatedColumn } from './RecordBoardDeprecatedColumn';

export type RecordBoardDeprecatedProps = {
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

export const RecordBoardDeprecated = ({
  recordBoardId,
  boardOptions,
  onColumnDelete,
  onEditColumnTitle,
}: RecordBoardDeprecatedProps) => {
  const recordBoardScopeId = recordBoardId;

  const { boardColumnsState } = useRecordBoardDeprecatedScopedStates({
    recordBoardScopeId,
  });
  const boardColumns = useRecoilValue(boardColumnsState);

  const { updateOneRecord: updateOneOpportunity } =
    useUpdateOneRecord<Opportunity>({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
    });

  const { unselectAllActiveCards, setCardSelected } =
    useSetRecordBoardDeprecatedCardSelectedInternal({ recordBoardScopeId });

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
    <RecordBoardDeprecatedScope recordBoardScopeId={recordBoardId}>
      <RecordBoardDeprecatedContextMenu />
      <RecordBoardDeprecatedActionBar />
      <RecordBoardDeprecatedInternalEffect />

      <StyledWrapper>
        <StyledBoardHeader />
        <ScrollWrapper>
          <StyledBoard ref={boardRef}>
            <DragDropContext onDragEnd={onDragEnd}>
              {sortedBoardColumns.map((column) => (
                <RecordBoardDeprecatedColumn
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
    </RecordBoardDeprecatedScope>
  );
};
