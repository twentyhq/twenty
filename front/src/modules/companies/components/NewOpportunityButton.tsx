import { useCallback, useContext, useState } from 'react';
import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRelationPicker } from '@/ui/input/components/internal/relation-picker/hooks/useRelationPicker';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { NewButton } from '@/ui/object/record-board/components/NewButton';
import { BoardColumnContext } from '@/ui/object/record-board/contexts/BoardColumnContext';
import { useCreateOpportunity } from '@/ui/object/record-board/hooks/internal/useCreateOpportunity';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

export const NewOpportunityButton = () => {
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
      enqueueSnackBar('Pipeline stage id is not defined', {
        variant: 'error',
      });

      throw new Error('Pipeline stage id is not defined');
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

  const [relationPickerSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  // TODO: refactor useFilteredSearchEntityQuery
  const { findManyRecordsQuery } = useObjectMetadataItem({
    objectNameSingular: 'company',
  });
  const useFindManyQuery = (options: any) =>
    useQuery(findManyRecordsQuery, options);
  const { identifiersMapper, searchQuery } = useRelationPicker();

  const filteredSearchEntityResults = useFilteredSearchEntityQuery({
    queryHook: useFindManyQuery,
    filters: [
      {
        fieldNames: searchQuery?.computeFilterFields?.('company') ?? [],
        filter: relationPickerSearchFilter,
      },
    ],
    orderByField: 'createdAt',
    selectedIds: [],
    mappingFunction: (record: any) => identifiersMapper?.(record, 'company'),
    objectNameSingular: 'company',
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
