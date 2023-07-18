import { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { usePreviousHotkeyScope } from '@/lib/hotkeys/hooks/usePreviousHotkeyScope';
import { GET_PIPELINES } from '@/pipeline-progress/services';
import { BoardColumnContext } from '@/pipeline-progress/states/BoardColumnContext';
import { boardState } from '@/pipeline-progress/states/boardState';
import { currentPipelineState } from '@/pipeline-progress/states/currentPipelineState';
import { pipelineStageIdScopedState } from '@/pipeline-progress/states/pipelineStageIdScopedState';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/relation-picker/states/relationPickerSearchFilterScopedState';
import { RelationPickerHotkeyScope } from '@/relation-picker/types/RelationPickerHotkeyScope';
import { BoardPipelineStageColumn } from '@/ui/board/components/Board';
import { NewButton } from '@/ui/board/components/NewButton';
import {
  PipelineProgressableType,
  useCreateOnePipelineProgressMutation,
} from '~/generated/graphql';

import { useFilteredSearchCompanyQuery } from '../queries';

export function NewCompanyProgressButton() {
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [board, setBoard] = useRecoilState(boardState);
  const [pipeline] = useRecoilState(currentPipelineState);
  const [pipelineStageId] = useRecoilScopedState(
    pipelineStageIdScopedState,
    BoardColumnContext,
  );

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const [createOnePipelineProgress] = useCreateOnePipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  const handleEntitySelect = useCallback(
    async (company: any) => {
      if (!company) return;

      setIsCreatingCard(false);
      goBackToPreviousHotkeyScope();

      const newUuid = uuidv4();
      const newBoard = JSON.parse(JSON.stringify(board));
      const destinationColumnIndex = newBoard.findIndex(
        (column: BoardPipelineStageColumn) =>
          column.pipelineStageId === pipelineStageId,
      );
      newBoard[destinationColumnIndex].pipelineProgressIds.push(newUuid);
      setBoard(newBoard);
      await createOnePipelineProgress({
        variables: {
          uuid: newUuid,
          pipelineStageId: pipelineStageId || '',
          pipelineId: pipeline?.id || '',
          entityId: company.id || '',
          entityType: PipelineProgressableType.Company,
        },
      });
    },
    [
      goBackToPreviousHotkeyScope,
      board,
      setBoard,
      createOnePipelineProgress,
      pipelineStageId,
      pipeline?.id,
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

  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );
  const companies = useFilteredSearchCompanyQuery({ searchFilter });

  return (
    <>
      {isCreatingCard ? (
        <SingleEntitySelect
          onEntitySelected={(value) => handleEntitySelect(value)}
          onCancel={handleCancel}
          entities={{
            entitiesToSelect: companies.entitiesToSelect,
            selectedEntity: companies.selectedEntities[0],
            loading: companies.loading,
          }}
          disableBackgroundBlur={true}
        />
      ) : (
        <NewButton onClick={handleNewClick} />
      )}
    </>
  );
}
