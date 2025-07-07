import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyStateV2';
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
  StepOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

export const useAddRootStepFilter = () => {
  const { readonly, onFilterSettingsUpdate } = useContext(
    WorkflowStepFilterContext,
  );

  const currentStepFilterGroupsCallbackState =
    useRecoilComponentCallbackStateV2(currentStepFilterGroupsComponentState);

  const currentStepFiltersCallbackState = useRecoilComponentCallbackStateV2(
    currentStepFiltersComponentState,
  );

  const setHasInitializedCurrentStepFilters =
    useSetRecoilComponentFamilyStateV2(
      hasInitializedCurrentStepFiltersComponentFamilyState,
      {},
    );

  const setHasInitializedCurrentStepFilterGroups =
    useSetRecoilComponentFamilyStateV2(
      hasInitializedCurrentStepFilterGroupsComponentFamilyState,
      {},
    );

  const addRootStepFilterRecoilCallback = useRecoilCallback(
    ({ set }) =>
      () => {
        if (readonly === true) return;

        const newStepFilterGroup: StepFilterGroup = {
          id: v4(),
          logicalOperator: StepLogicalOperator.AND,
        };

        const newStepFilter: StepFilter = {
          id: v4(),
          type: 'text',
          label: 'New Filter',
          value: '',
          operand: StepOperand.EQ,
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
      readonly,
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
