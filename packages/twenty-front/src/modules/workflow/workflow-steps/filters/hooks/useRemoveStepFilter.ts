import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';

export const useRemoveStepFilter = () => {
  const { onFilterSettingsUpdate } = useContext(WorkflowStepFilterContext);

  const currentStepFilters = useRecoilComponentStateCallbackStateV2(
    currentStepFiltersComponentState,
  );

  const currentStepFilterGroups = useRecoilComponentStateCallbackStateV2(
    currentStepFilterGroupsComponentState,
  );

  const store = useStore();

  const removeStepFilter = useCallback(
    (stepFilterId: string) => {
      const stepFilters = store.get(currentStepFilters);
      const stepFilterGroups = store.get(currentStepFilterGroups);

      const rootStepFilterGroup = stepFilterGroups.find(
        (filterGroup) => !isDefined(filterGroup.parentStepFilterGroupId),
      );

      if (!isDefined(rootStepFilterGroup)) return;

      const stepFilterToRemove = stepFilters.find(
        (filter) => filter.id === stepFilterId,
      );

      if (!isDefined(stepFilterToRemove)) return;

      const updatedStepFilters = stepFilters.filter(
        (filter) => filter.id !== stepFilterId,
      );

      const parentStepFilterGroup = stepFilterGroups.find(
        (filterGroup) =>
          filterGroup.id === stepFilterToRemove.stepFilterGroupId,
      );

      const stepFiltersInParentStepFilterGroup = updatedStepFilters.filter(
        (filter) => filter.stepFilterGroupId === parentStepFilterGroup?.id,
      );

      const stepFilterGroupsInParentStepFilterGroup = stepFilterGroups.filter(
        (group) => group.parentStepFilterGroupId === parentStepFilterGroup?.id,
      );

      const shouldDeleteParentStepFilterGroup =
        stepFiltersInParentStepFilterGroup.length === 0 &&
        stepFilterGroupsInParentStepFilterGroup.length === 0;

      const updatedStepFilterGroups = shouldDeleteParentStepFilterGroup
        ? stepFilterGroups.filter(
            (filterGroup) => filterGroup.id !== parentStepFilterGroup?.id,
          )
        : stepFilterGroups;

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
          stepFilters: updatedStepFilters,
          stepFilterGroups: updatedStepFilterGroups,
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
    removeStepFilter,
  };
};
