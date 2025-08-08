import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyState';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/currentStepFiltersComponentState';
import { hasInitializedCurrentStepFilterGroupsComponentFamilyState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/hasInitializedCurrentStepFilterGroupsComponentFamilyState';
import { hasInitializedCurrentStepFiltersComponentFamilyState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/hasInitializedCurrentStepFiltersComponentFamilyState';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import {
  StepFilter,
  StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

export const useAddRootStepFilter = () => {
  const { stepId, onFilterSettingsUpdate } = useContext(
    WorkflowStepFilterContext,
  );
  const currentStepFilterGroupsCallbackState = useRecoilComponentCallbackState(
    currentStepFilterGroupsComponentState,
  );

  const currentStepFiltersCallbackState = useRecoilComponentCallbackState(
    currentStepFiltersComponentState,
  );

  const setHasInitializedCurrentStepFilters = useSetRecoilComponentFamilyState(
    hasInitializedCurrentStepFiltersComponentFamilyState,
    { stepId },
  );

  const setHasInitializedCurrentStepFilterGroups =
    useSetRecoilComponentFamilyState(
      hasInitializedCurrentStepFilterGroupsComponentFamilyState,
      { stepId },
    );

  const addRootStepFilterRecoilCallback = useRecoilCallback(
    ({ set }) =>
      () => {
        const newStepFilterGroup: StepFilterGroup = {
          id: v4(),
          logicalOperator: StepLogicalOperator.AND,
        };

        const newStepFilter: StepFilter = {
          id: v4(),
          type: 'unknown',
          label: 'New Filter',
          value: '',
          operand: ViewFilterOperand.Is,
          displayValue: '',
          stepFilterGroupId: newStepFilterGroup.id,
          stepOutputKey: '',
          positionInStepFilterGroup: 0,
        };

        set(currentStepFilterGroupsCallbackState, [newStepFilterGroup]);
        set(currentStepFiltersCallbackState, [newStepFilter]);

        setHasInitializedCurrentStepFilters(true);
        setHasInitializedCurrentStepFilterGroups(true);

        onFilterSettingsUpdate({
          stepFilterGroups: [newStepFilterGroup],
          stepFilters: [newStepFilter],
        });
      },
    [
      onFilterSettingsUpdate,
      currentStepFilterGroupsCallbackState,
      currentStepFiltersCallbackState,
      setHasInitializedCurrentStepFilters,
      setHasInitializedCurrentStepFilterGroups,
    ],
  );

  return {
    addRootStepFilter: addRootStepFilterRecoilCallback,
  };
};
