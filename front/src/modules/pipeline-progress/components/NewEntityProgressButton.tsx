import { useCallback, useRef, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { usePreviousHotkeyScope } from '@/lib/hotkeys/hooks/usePreviousHotkeyScope';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { RelationPickerHotkeyScope } from '@/relation-picker/types/RelationPickerHotkeyScope';
import { BoardPipelineStageColumn } from '@/ui/board/components/Board';
import { NewButton as UINewButton } from '@/ui/board/components/NewButton';
import {
  PipelineProgressableType,
  useCreateOnePipelineProgressMutation,
} from '~/generated/graphql';

import { GET_PIPELINES } from '../queries';
import { boardColumnsState } from '../states/boardColumnsState';
import { boardItemsState } from '../states/boardItemsState';

type OwnProps = {
  pipelineId: string;
  columnId: string;
  NewEntityBoardCardComponent: React.FC<{
    onEntitySelect: (entity: any) => void;
    onCancel: () => void;
  }>;
  entityType: PipelineProgressableType;
};

export function NewEntityProgressButton({
  pipelineId,
  columnId,
  NewEntityBoardCardComponent,
  entityType,
}: OwnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [board, setBoard] = useRecoilState(boardColumnsState);
  const [boardItems, setBoardItems] = useRecoilState(boardItemsState);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const [createOnePipelineProgress] = useCreateOnePipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  const handleEntitySelect = useCallback(
    async (entity: any) => {
      if (!entity) return;

      setIsCreatingCard(false);
      goBackToPreviousHotkeyScope();

      const newUuid = uuidv4();
      const newBoard = JSON.parse(JSON.stringify(board));
      const destinationColumnIndex = newBoard.findIndex(
        (column: BoardPipelineStageColumn) =>
          column.pipelineStageId === columnId,
      );
      newBoard[destinationColumnIndex].itemKeys.push(newUuid);
      setBoardItems({
        ...boardItems,
        [newUuid]: {
          entity,
          pipelineProgress: {
            id: newUuid,
            amount: 0,
          },
        },
      });
      setBoard(newBoard);
      await createOnePipelineProgress({
        variables: {
          uuid: newUuid,
          pipelineStageId: columnId,
          pipelineId,
          entityId: entity.id,
          entityType,
        },
      });
    },
    [
      goBackToPreviousHotkeyScope,
      board,
      setBoardItems,
      boardItems,
      setBoard,
      createOnePipelineProgress,
      columnId,
      pipelineId,
      entityType,
    ],
  );

  const handleNewClick = useCallback(() => {
    setIsCreatingCard(true);
    setHotkeyScopeAndMemorizePreviousScope(
      RelationPickerHotkeyScope.RelationPicker,
    );
  }, [setIsCreatingCard, setHotkeyScopeAndMemorizePreviousScope]);

  function handleCancel() {
    goBackToPreviousHotkeyScope();
    setIsCreatingCard(false);
  }

  return (
    <>
      {isCreatingCard && (
        <RecoilScope>
          <div ref={containerRef}>
            <NewEntityBoardCardComponent
              onEntitySelect={handleEntitySelect}
              onCancel={handleCancel}
            />
          </div>
        </RecoilScope>
      )}
      <UINewButton onClick={handleNewClick} />
    </>
  );
}
