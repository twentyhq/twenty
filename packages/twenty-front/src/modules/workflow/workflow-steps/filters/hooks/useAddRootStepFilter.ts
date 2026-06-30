import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
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
  const { onFilterSettingsUpdate } = useContext(WorkflowStepFilterContext);
  const currentStepFilterGroups = useAtomComponentStateCallbackState(
    currentStepFilterGroupsComponentState,
  );

  const currentStepFilters = useAtomComponentStateCallbackState(
    currentStepFiltersComponentState,
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

    onFilterSettingsUpdate({
      stepFilterGroups: [newStepFilterGroup],
      stepFilters: [newStepFilter],
    });
  }, [
    onFilterSettingsUpdate,
    currentStepFilterGroups,
    currentStepFilters,
    store,
  ]);

  return {
    addRootStepFilter,
  };
};
