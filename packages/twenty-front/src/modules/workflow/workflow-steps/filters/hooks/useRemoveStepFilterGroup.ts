import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveStepFilterGroup = () => {
  const { onFilterSettingsUpdate } = useContext(WorkflowStepFilterContext);

  const currentStepFilterGroups = useRecoilComponentStateCallbackStateV2(
    currentStepFilterGroupsComponentState,
  );

  const currentStepFilters = useRecoilComponentStateCallbackStateV2(
    currentStepFiltersComponentState,
  );

  const store = useStore();

  const removeStepFilterGroup = useCallback(
    (stepFilterGroupId: string) => {
      const stepFilterGroups = store.get(currentStepFilterGroups);
      const stepFilters = store.get(currentStepFilters);

      const rootStepFilterGroup = stepFilterGroups.find(
        (filterGroup) => !isDefined(filterGroup.parentStepFilterGroupId),
      );

      const updatedStepFilterGroups = stepFilterGroups.filter(
        (filterGroup) => filterGroup.id !== stepFilterGroupId,
      );

      const updatedStepFilters = stepFilters.filter(
        (filter) => filter.stepFilterGroupId !== stepFilterGroupId,
      );

      const shouldResetStepFilterSettings =
        updatedStepFilterGroups.length === 1 &&
        updatedStepFilterGroups[0].id === rootStepFilterGroup?.id &&
        updatedStepFilters.length === 0;

      if (shouldResetStepFilterSettings) {
        store.set(currentStepFilterGroups, []);
        store.set(currentStepFilters, []);

        onFilterSettingsUpdate({
          stepFilterGroups: [],
          stepFilters: [],
        });
      } else {
        store.set(currentStepFilterGroups, updatedStepFilterGroups);
        store.set(currentStepFilters, updatedStepFilters);

        onFilterSettingsUpdate({
          stepFilterGroups: updatedStepFilterGroups,
          stepFilters: updatedStepFilters,
        });
      }
    },
    [
      onFilterSettingsUpdate,
      currentStepFilterGroups,
      currentStepFilters,
      store,
    ],
  );

  return {
    removeStepFilterGroup,
  };
};
