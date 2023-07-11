import { useCallback, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { v4 as uuidv4 } from 'uuid';

import { usePreviousHotkeysScope } from '@/hotkeys/hooks/internal/usePreviousHotkeysScope';
import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { Column } from '@/ui/board/components/Board';
import { NewButton as UINewButton } from '@/ui/board/components/NewButton';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import {
  Company,
  PipelineProgressableType,
  useCreateOnePipelineProgressMutation,
} from '~/generated/graphql';

import { boardColumnsState } from '../states/boardColumnsState';
import { boardItemsState } from '../states/boardItemsState';

import { NewCompanyBoardCard } from './NewCompanyBoardCard';

type OwnProps = {
  pipelineId: string;
  columnId: string;
};

export function NewButton({ pipelineId, columnId }: OwnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [board, setBoard] = useRecoilState(boardColumnsState);
  const [boardItems, setBoardItems] = useRecoilState(boardItemsState);

  const [createOnePipelineProgress] = useCreateOnePipelineProgressMutation();

  const {
    goBackToPreviousHotkeysScope,
    setHotkeysScopeAndMemorizePreviousScope,
  } = usePreviousHotkeysScope();

  const handleEntitySelect = useCallback(
    async (company: Pick<Company, 'id' | 'name' | 'domainName'>) => {
      setIsCreatingCard(false);
      goBackToPreviousHotkeysScope();

      const newUuid = uuidv4();
      const newBoard = JSON.parse(JSON.stringify(board));
      const destinationColumnIndex = newBoard.findIndex(
        (column: Column) => column.id === columnId,
      );
      newBoard[destinationColumnIndex].itemKeys.push(newUuid);
      setBoardItems({
        ...boardItems,
        [newUuid]: {
          company,
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
          entityId: company.id,
          entityType: PipelineProgressableType.Company,
        },
      });
    },
    [
      createOnePipelineProgress,
      columnId,
      pipelineId,
      board,
      setBoard,
      boardItems,
      setBoardItems,
      goBackToPreviousHotkeysScope,
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
            <NewCompanyBoardCard
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
