import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/currentStepFiltersComponentState';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { StepFilter, StepFilterGroup } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useUpsertStepFilterSettings = () => {
  const currentStepFilterGroupsCallbackState = useRecoilComponentCallbackState(
    currentStepFilterGroupsComponentState,
  );

  const currentStepFiltersCallbackState = useRecoilComponentCallbackState(
    currentStepFiltersComponentState,
  );
  const { onFilterSettingsUpdate } = useContext(WorkflowStepFilterContext);

  const upsertStepFilterSettingsRecoilCallback = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        stepFilterGroupToUpsert,
        stepFilterToUpsert,
      }: {
        stepFilterGroupToUpsert?: StepFilterGroup;
        stepFilterToUpsert?: StepFilter;
      }) => {
        const stepFilterGroups = getSnapshotValue(
          snapshot,
          currentStepFilterGroupsCallbackState,
        );

        const stepFilters = getSnapshotValue(
          snapshot,
          currentStepFiltersCallbackState,
        );

        const updatedStepFilterGroups = [...(stepFilterGroups ?? [])];
        const updatedStepFilters = [...(stepFilters ?? [])];

        if (isDefined(stepFilterGroupToUpsert)) {
          const existingIndex = updatedStepFilterGroups.findIndex(
            (filterGroup) => filterGroup.id === stepFilterGroupToUpsert.id,
          );

          if (existingIndex >= 0) {
            updatedStepFilterGroups[existingIndex] = stepFilterGroupToUpsert;
          } else {
            updatedStepFilterGroups.push(stepFilterGroupToUpsert);
          }
          set(currentStepFilterGroupsCallbackState, updatedStepFilterGroups);
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
          set(currentStepFiltersCallbackState, updatedStepFilters);
        }

        onFilterSettingsUpdate({
          stepFilterGroups: updatedStepFilterGroups,
          stepFilters: updatedStepFilters,
        });
      },
    [
      onFilterSettingsUpdate,
      currentStepFilterGroupsCallbackState,
      currentStepFiltersCallbackState,
    ],
  );

  return {
    upsertStepFilterSettings: upsertStepFilterSettingsRecoilCallback,
  };
};
