import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';

export const useRemoveStepFilter = () => {
  const { onFilterSettingsUpdate } = useContext(WorkflowStepFilterContext);

  const currentStepFiltersCallbackState = useRecoilComponentCallbackState(
    currentStepFiltersComponentState,
  );

  const currentStepFilterGroupsCallbackState = useRecoilComponentCallbackState(
    currentStepFilterGroupsComponentState,
  );

  const removeStepFilterRecoilCallback = useRecoilCallback(
    ({ set, snapshot }) =>
      (stepFilterId: string) => {
        const stepFilters = getSnapshotValue(
          snapshot,
          currentStepFiltersCallbackState,
        );

        const stepFilterGroups = getSnapshotValue(
          snapshot,
          currentStepFilterGroupsCallbackState,
        );

        const rootStepFilterGroup = stepFilterGroups?.find(
          (filterGroup) => !isDefined(filterGroup.parentStepFilterGroupId),
        );

        if (!isDefined(rootStepFilterGroup)) return;

        const stepFilterToRemove = stepFilters?.find(
          (filter) => filter.id === stepFilterId,
        );

        if (!isDefined(stepFilterToRemove)) return;

        const updatedStepFilters = (stepFilters ?? []).filter(
          (filter) => filter.id !== stepFilterId,
        );

        const parentStepFilterGroup = stepFilterGroups?.find(
          (filterGroup) =>
            filterGroup.id === stepFilterToRemove.stepFilterGroupId,
        );

        const stepFiltersInParentStepFilterGroup = updatedStepFilters?.filter(
          (filter) => filter.stepFilterGroupId === parentStepFilterGroup?.id,
        );

        const stepFilterGroupsInParentStepFilterGroup =
          stepFilterGroups?.filter(
            (g) => g.parentStepFilterGroupId === parentStepFilterGroup?.id,
          );

        const shouldDeleteParentStepFilterGroup =
          stepFiltersInParentStepFilterGroup?.length === 0 &&
          stepFilterGroupsInParentStepFilterGroup?.length === 0;

        const updatedStepFilterGroups = shouldDeleteParentStepFilterGroup
          ? (stepFilterGroups ?? []).filter(
              (filterGroup) => filterGroup.id !== parentStepFilterGroup?.id,
            )
          : stepFilterGroups;

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
            stepFilters: updatedStepFilters,
            stepFilterGroups: updatedStepFilterGroups,
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
    removeStepFilter: removeStepFilterRecoilCallback,
  };
};
