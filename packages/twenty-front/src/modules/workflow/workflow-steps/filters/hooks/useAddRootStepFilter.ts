import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentFamilyStateV2';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { hasInitializedCurrentStepFilterGroupsComponentFamilyState } from '@/workflow/workflow-steps/filters/states/hasInitializedCurrentStepFilterGroupsComponentFamilyState';
import { hasInitializedCurrentStepFiltersComponentFamilyState } from '@/workflow/workflow-steps/filters/states/hasInitializedCurrentStepFiltersComponentFamilyState';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import {
  type StepFilter,
  type StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

export const useAddRootStepFilter = () => {
  const { stepId, onFilterSettingsUpdate } = useContext(
    WorkflowStepFilterContext,
  );
  const currentStepFilterGroups = useRecoilComponentStateCallbackStateV2(
    currentStepFilterGroupsComponentState,
  );

  const currentStepFilters = useRecoilComponentStateCallbackStateV2(
    currentStepFiltersComponentState,
  );

  const setHasInitializedCurrentStepFilters =
    useSetRecoilComponentFamilyStateV2(
      hasInitializedCurrentStepFiltersComponentFamilyState,
      { stepId },
    );

  const setHasInitializedCurrentStepFilterGroups =
    useSetRecoilComponentFamilyStateV2(
      hasInitializedCurrentStepFilterGroupsComponentFamilyState,
      { stepId },
    );

  const store = useStore();

  const addRootStepFilter = useCallback(() => {
    const newStepFilterGroup: StepFilterGroup = {
      id: v4(),
      logicalOperator: StepLogicalOperator.AND,
    };

    const newStepFilter: StepFilter = {
      id: v4(),
      type: 'unknown',
      value: '',
      operand: ViewFilterOperand.IS,
      stepFilterGroupId: newStepFilterGroup.id,
      stepOutputKey: '',
      positionInStepFilterGroup: 0,
    };

    store.set(currentStepFilterGroups, [newStepFilterGroup]);
    store.set(currentStepFilters, [newStepFilter]);

    setHasInitializedCurrentStepFilters(true);
    setHasInitializedCurrentStepFilterGroups(true);

    onFilterSettingsUpdate({
      stepFilterGroups: [newStepFilterGroup],
      stepFilters: [newStepFilter],
    });
  }, [
    onFilterSettingsUpdate,
    currentStepFilterGroups,
    currentStepFilters,
    setHasInitializedCurrentStepFilters,
    setHasInitializedCurrentStepFilterGroups,
    store,
  ]);

  return {
    addRootStepFilter,
  };
};
