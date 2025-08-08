import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/currentStepFiltersComponentState';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveStepFilterGroup = () => {
  const { onFilterSettingsUpdate } = useContext(WorkflowStepFilterContext);

  const currentStepFilterGroupsCallbackState = useRecoilComponentCallbackState(
    currentStepFilterGroupsComponentState,
  );

  const currentStepFiltersCallbackState = useRecoilComponentCallbackState(
    currentStepFiltersComponentState,
  );

  const removeStepFilterGroupRecoilCallback = useRecoilCallback(
    ({ set, snapshot }) =>
      (stepFilterGroupId: string) => {
        const stepFilterGroups = getSnapshotValue(
          snapshot,
          currentStepFilterGroupsCallbackState,
        );

        const stepFilters = getSnapshotValue(
          snapshot,
          currentStepFiltersCallbackState,
        );

        const rootStepFilterGroup = stepFilterGroups?.find(
          (filterGroup) => !isDefined(filterGroup.parentStepFilterGroupId),
        );

        const updatedStepFilterGroups = (stepFilterGroups ?? []).filter(
          (filterGroup) => filterGroup.id !== stepFilterGroupId,
        );

        const updatedStepFilters = (stepFilters ?? []).filter(
          (filter) => filter.stepFilterGroupId !== stepFilterGroupId,
        );

        const shouldResetStepFilterSettings =
          updatedStepFilterGroups.length === 1 &&
          updatedStepFilterGroups[0].id === rootStepFilterGroup?.id &&
          updatedStepFilters.length === 0;

        if (shouldResetStepFilterSettings) {
          set(currentStepFilterGroupsCallbackState, []);
          set(currentStepFiltersCallbackState, []);

          onFilterSettingsUpdate({
            stepFilterGroups: [],
            stepFilters: [],
          });
        } else {
          set(currentStepFilterGroupsCallbackState, updatedStepFilterGroups);
          set(currentStepFiltersCallbackState, updatedStepFilters);

          onFilterSettingsUpdate({
            stepFilterGroups: updatedStepFilterGroups,
            stepFilters: updatedStepFilters,
          });
        }
      },
    [
      onFilterSettingsUpdate,
      currentStepFilterGroupsCallbackState,
      currentStepFiltersCallbackState,
    ],
  );

  return {
    removeStepFilterGroup: removeStepFilterGroupRecoilCallback,
  };
};
