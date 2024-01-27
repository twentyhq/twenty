import { useCallback, useContext, useState } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { NewButton } from '@/object-record/record-board-deprecated/components/NewButton';
import { BoardColumnContext } from '@/object-record/record-board-deprecated/contexts/BoardColumnContext';
import { useCreateOpportunity } from '@/object-record/record-board-deprecated/hooks/internal/useCreateOpportunity';
import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import useI18n from '@/ui/i18n/useI18n';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

export const NewOpportunityButton = () => {
  const { translate } = useI18n('translations');
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const column = useContext(BoardColumnContext);

  const pipelineStepId = column?.columnDefinition.id || '';

  const { enqueueSnackBar } = useSnackBar();
  const createOpportunity = useCreateOpportunity();

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const handleEntitySelect = (company: any) => {
    setIsCreatingCard(false);
    goBackToPreviousHotkeyScope();

    if (!pipelineStepId) {
      enqueueSnackBar(translate('pipelineStageIdIsNotDefined'), {
        variant: 'error',
      });

      throw new Error(translate('pipelineStageIdIsNotDefined'));
    }

    createOpportunity(company.id, pipelineStepId);
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

  const { relationPickerSearchFilter, searchQuery } = useRelationPicker();

  const filteredSearchEntityResults = useFilteredSearchEntityQuery({
    filters: [
      {
        fieldNames: searchQuery?.computeFilterFields?.('company') ?? [],
        filter: relationPickerSearchFilter,
      },
    ],
    orderByField: 'createdAt',
    selectedIds: [],
    objectNameSingular: CoreObjectNameSingular.Company,
  });

  return (
    <>
      {isCreatingCard ? (
        <SingleEntitySelect
          disableBackgroundBlur
          entitiesToSelect={filteredSearchEntityResults.entitiesToSelect}
          loading={filteredSearchEntityResults.loading}
          onCancel={handleCancel}
          onEntitySelected={handleEntitySelect}
          selectedEntity={filteredSearchEntityResults.selectedEntities[0]}
        />
      ) : (
        <NewButton onClick={handleNewClick} />
      )}
    </>
  );
};
