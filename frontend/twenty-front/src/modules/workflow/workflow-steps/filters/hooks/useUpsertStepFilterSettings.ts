import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useUpsertStepFilterSettings = () => {
  const currentStepFilterGroups = useAtomComponentStateCallbackState(
    currentStepFilterGroupsComponentState,
  );

  const currentStepFilters = useAtomComponentStateCallbackState(
    currentStepFiltersComponentState,
  );
  const { onFilterSettingsUpdate } = useContext(WorkflowStepFilterContext);

  const store = useStore();

  const upsertStepFilterSettings = useCallback(
    ({
      stepFilterGroupToUpsert,
      stepFilterToUpsert,
    }: {
      stepFilterGroupToUpsert?: StepFilterGroup;
      stepFilterToUpsert?: StepFilter;
    }) => {
      const stepFilterGroups = store.get(currentStepFilterGroups);
      const stepFilters = store.get(currentStepFilters);

      const updatedStepFilterGroups = [...stepFilterGroups];
      const updatedStepFilters = [...stepFilters];

      if (isDefined(stepFilterGroupToUpsert)) {
        const existingIndex = updatedStepFilterGroups.findIndex(
          (filterGroup) => filterGroup.id === stepFilterGroupToUpsert.id,
        );

        if (existingIndex >= 0) {
          updatedStepFilterGroups[existingIndex] = stepFilterGroupToUpsert;
        } else {
          updatedStepFilterGroups.push(stepFilterGroupToUpsert);
        }
        store.set(currentStepFilterGroups, updatedStepFilterGroups);
      }

      if (isDefined(stepFilterToUpsert)) {
        const existingIndex = updatedStepFilters.findIndex(
          (filter) => filter.id === stepFilterToUpsert.id,
        );

        if (existingIndex >= 0) {
          updatedStepFilters[existingIndex] = stepFilterToUpsert;
        } else {
          updatedStepFilters.push(stepFilterToUpsert);
        }
        store.set(currentStepFilters, updatedStepFilters);
      }

      onFilterSettingsUpdate({
        stepFilterGroups: updatedStepFilterGroups,
        stepFilters: updatedStepFilters,
      });
    },
    [
      onFilterSettingsUpdate,
      currentStepFilterGroups,
      currentStepFilters,
      store,
    ],
  );

  return {
    upsertStepFilterSettings,
  };
};
