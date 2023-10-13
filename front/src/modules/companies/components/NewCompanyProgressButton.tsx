import { useCallback, useContext, useState } from 'react';

import { useSnackBar } from '@/ui/Feedback/Snack Bar/hooks/useSnackBar';
import { SingleEntitySelect } from '@/ui/Input/Relation Picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/Input/Relation Picker/states/relationPickerSearchFilterScopedState';
import { RelationPickerHotkeyScope } from '@/ui/Input/Relation Picker/types/RelationPickerHotkeyScope';
import { NewButton } from '@/ui/Layout/Board/components/NewButton';
import { BoardColumnContext } from '@/ui/Layout/Board/contexts/BoardColumnContext';
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
