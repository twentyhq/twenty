import { useCallback, useContext, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { GET_PIPELINE_PROGRESS, GET_PIPELINES } from '@/pipeline/queries';
import { boardCardIdsByColumnIdFamilyState } from '@/pipeline/states/boardCardIdsByColumnIdFamilyState';
import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { NewButton } from '@/ui/board/components/NewButton';
import { BoardColumnIdContext } from '@/ui/board/states/BoardColumnIdContext';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import {
  PipelineProgressableType,
  useCreateOnePipelineProgressMutation,
} from '~/generated/graphql';

import { useFilteredSearchCompanyQuery } from '../queries';

export function NewCompanyProgressButton() {
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [pipeline] = useRecoilState(currentPipelineState);
  const pipelineStageId = useContext(BoardColumnIdContext);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const [createOnePipelineProgress] = useCreateOnePipelineProgressMutation({
    refetchQueries: [
      getOperationName(GET_PIPELINE_PROGRESS) ?? '',
      getOperationName(GET_PIPELINES) ?? '',
    ],
  });

  const handleEntitySelect = useRecoilCallback(
    ({ set }) =>
      async (company: any) => {
        if (!company) return;

        if (!pipelineStageId) throw new Error('pipelineStageId is not defined');

        setIsCreatingCard(false);

        goBackToPreviousHotkeyScope();

        const newUuid = uuidv4();

        set(boardCardIdsByColumnIdFamilyState(pipelineStageId), (oldValue) => [
          ...oldValue,
          newUuid,
        ]);

        await createOnePipelineProgress({
          variables: {
            uuid: newUuid,
            pipelineStageId: pipelineStageId,
            pipelineId: pipeline?.id ?? '',
            entityId: company.id ?? '',
            entityType: PipelineProgressableType.Company,
          },
        });
      },
    [
      goBackToPreviousHotkeyScope,
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
