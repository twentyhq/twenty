import { useCallback, useRef, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { usePreviousHotkeysScope } from '@/hotkeys/hooks/internal/usePreviousHotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { NewEntityProgressButton } from '@/pipeline-progress/components/NewEntityProgressButton';
import { GET_PIPELINES } from '@/pipeline-progress/queries';
import { BoardColumnContext } from '@/pipeline-progress/states/BoardColumnContext';
import { boardColumnsState } from '@/pipeline-progress/states/boardColumnsState';
import { boardItemsState } from '@/pipeline-progress/states/boardItemsState';
import { pipelineStageIdScopedState } from '@/pipeline-progress/states/pipelineStageIdScopedState';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { BoardPipelineStageColumn } from '@/ui/board/components/Board';
import { NewButton } from '@/ui/board/components/NewButton';
import {
  PipelineProgressableType,
  useCreateOnePipelineProgressMutation,
} from '~/generated/graphql';
import { boardState } from '~/pages/opportunities/boardState';
import { currentPipelineState } from '~/pages/opportunities/currentPipelineState';

import { NewCompanyBoardCard } from './NewCompanyBoardCard';

export function NewCompanyProgressButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [board, setBoard] = useRecoilState(boardState);
  const [pipeline] = useRecoilState(currentPipelineState);
  const [pipelineStageId, setPipelineStageId] = useRecoilScopedState(
    pipelineStageIdScopedState,
    BoardColumnContext,
  );

  const {
    goBackToPreviousHotkeysScope,
    setHotkeysScopeAndMemorizePreviousScope,
  } = usePreviousHotkeysScope();

  const [createOnePipelineProgress] = useCreateOnePipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  const handleEntitySelect = useCallback(
    async (entity: any) => {
      if (!entity) return;

      setIsCreatingCard(false);
      goBackToPreviousHotkeysScope();

      const newUuid = uuidv4();
      const newBoard = JSON.parse(JSON.stringify(board));
      const destinationColumnIndex = newBoard.findIndex(
        (column: BoardPipelineStageColumn) =>
          column.pipelineStageId === pipelineStageId,
      );
      newBoard[destinationColumnIndex].itemKeys.push(newUuid);
      setBoard(newBoard);
      await createOnePipelineProgress({
        variables: {
          uuid: newUuid,
          pipelineStageId: pipelineStageId || '',
          pipelineId: pipeline?.id || '',
          entityId: entity.id,
          entityType: PipelineProgressableType.Company,
        },
      });
    },
    [
      goBackToPreviousHotkeysScope,
      board,
      setBoard,
      createOnePipelineProgress,
      pipelineStageId,
      pipeline?.id,
    ],
  );

  const handleNewClick = useCallback(() => {
    setIsCreatingCard(true);
    setHotkeysScopeAndMemorizePreviousScope(
      InternalHotkeysScope.RelationPicker,
    );
  }, [setIsCreatingCard, setHotkeysScopeAndMemorizePreviousScope]);

  function handleCancel() {
    goBackToPreviousHotkeysScope();
    setIsCreatingCard(false);
  }

  return (
    <>
      {isCreatingCard && (
        <RecoilScope>
          <div ref={containerRef}>
            <NewEntityProgressButton
              pipelineId={pipeline?.id || ''}
              columnId={pipelineStageId || ''}
              NewEntityBoardCardComponent={NewCompanyBoardCard}
              entityType={PipelineProgressableType.Company}
            />
          </div>
        </RecoilScope>
      )}
      <NewButton onClick={handleNewClick} />
    </>
  );
}
