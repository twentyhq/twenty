import { useCallback, useContext, useState } from 'react';

import { NewButton } from '@/ui/board/components/NewButton';
import { BoardColumnContext } from '@/ui/board/contexts/BoardColumnContext';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useCreateCompanyProgress } from '../hooks/useCreateCompanyProgress';
import { useFilteredSearchCompanyQuery } from '../hooks/useFilteredSearchCompanyQuery';

export const NewCompanyProgressButton = () => {
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const column = useContext(BoardColumnContext);

  const pipelineStageId = column?.columnDefinition.id || '';

  const { enqueueSnackBar } = useSnackBar();

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const createCompanyProgress = useCreateCompanyProgress();

  const handleEntitySelect = (company: any) => {
    setIsCreatingCard(false);
    goBackToPreviousHotkeyScope();

    if (!pipelineStageId) {
      enqueueSnackBar('Pipeline stage id is not defined', {
        variant: 'error',
      });

      throw new Error('Pipeline stage id is not defined');
    }

    createCompanyProgress(company.id, pipelineStageId);
  };

  const handleNewClick = useCallback(() => {
    setIsCreatingCard(true);
    setHotkeyScopeAndMemorizePreviousScope(
      RelationPickerHotkeyScope.RelationPicker,
    );
  }, [setIsCreatingCard, setHotkeyScopeAndMemorizePreviousScope]);

  const handleCancel = () => {
    goBackToPreviousHotkeyScope();
    setIsCreatingCard(false);
  };

  const [relationPickerSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const companies = useFilteredSearchCompanyQuery({
    searchFilter: relationPickerSearchFilter,
  });

  return (
    <>
      {isCreatingCard ? (
        <SingleEntitySelect
          disableBackgroundBlur
          entitiesToSelect={companies.entitiesToSelect}
          loading={companies.loading}
          onCancel={handleCancel}
          onEntitySelected={handleEntitySelect}
          selectedEntity={companies.selectedEntities[0]}
        />
      ) : (
        <NewButton onClick={handleNewClick} />
      )}
    </>
  );
};
