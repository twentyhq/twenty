import { useCallback, useContext, useState } from 'react';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { NewButton } from '@/ui/layout/board/components/NewButton';
import { BoardColumnContext } from '@/ui/layout/board/contexts/BoardColumnContext';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

export const NewCompanyProgressButton = () => {
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const column = useContext(BoardColumnContext);

  const pipelineStepId = column?.columnDefinition.id || '';

  const { enqueueSnackBar } = useSnackBar();

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const handleEntitySelect = (company: any) => {
    setIsCreatingCard(false);
    goBackToPreviousHotkeyScope();

    if (!pipelineStepId) {
      enqueueSnackBar('Pipeline stage id is not defined', {
        variant: 'error',
      });

      throw new Error('Pipeline stage id is not defined');
    }

    //createCompanyProgress(company.id, pipelineStepId);
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

  // const companies = useFilteredSearchCompanyQuery({
  //   searchFilter: relationPickerSearchFilter,
  // });

  return (
    <>
      {isCreatingCard ? (
        <>TODO</>
      ) : (
        // <SingleEntitySelect
        //   disableBackgroundBlur
        //   entitiesToSelect={companies.entitiesToSelect}
        //   loading={companies.loading}
        //   onCancel={handleCancel}
        //   onEntitySelected={handleEntitySelect}
        //   selectedEntity={companies.selectedEntities[0]}
        // />
        <NewButton onClick={handleNewClick} />
      )}
    </>
  );
};
