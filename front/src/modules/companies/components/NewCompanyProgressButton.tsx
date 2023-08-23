import { useCallback, useContext, useState } from 'react';

import { NewButton } from '@/ui/board/components/NewButton';
import { BoardColumnIdContext } from '@/ui/board/contexts/BoardColumnIdContext';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useCreateCompanyProgress } from '../hooks/useCreateCompanyProgress';
import { useFilteredSearchCompanyQuery } from '../hooks/useFilteredSearchCompanyQuery';

export function NewCompanyProgressButton() {
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const pipelineStageId = useContext(BoardColumnIdContext);

  const { enqueueSnackBar } = useSnackBar();

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const createCompanyProgress = useCreateCompanyProgress();

  function handleEntitySelect(company: any) {
    setIsCreatingCard(false);
    goBackToPreviousHotkeyScope();

    if (!pipelineStageId) {
      enqueueSnackBar('Pipeline stage id is not defined', {
        variant: 'error',
      });

      throw new Error('Pipeline stage id is not defined');
    }

    createCompanyProgress(company, pipelineStageId);
  }

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
    <RecoilScope>
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
    </RecoilScope>
  );
}
