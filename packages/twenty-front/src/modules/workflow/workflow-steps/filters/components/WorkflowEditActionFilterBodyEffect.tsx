import { useSyncStepFilterStateFromDefaultValue } from '@/workflow/workflow-steps/filters/hooks/useSyncStepFilterStateFromDefaultValue';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { type FilterSettingsWithPotentiallyDeprecatedOperand } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { useMemo } from 'react';
import { convertViewFilterOperandToCoreOperand } from 'twenty-shared/utils';

export const WorkflowEditActionFilterBodyEffect = ({
  defaultValue,
}: {
  defaultValue?: FilterSettingsWithPotentiallyDeprecatedOperand;
}) => {
  const stepFiltersConverted = useMemo(() => {
    return defaultValue?.stepFilters?.map((filter) => ({
      ...filter,
      operand: convertViewFilterOperandToCoreOperand(filter.operand),
    }));
  }, [defaultValue?.stepFilters]);

  useSyncStepFilterStateFromDefaultValue({
    stepFilterSettingState: currentStepFiltersComponentState,
    defaultValue: stepFiltersConverted,
  });

  useSyncStepFilterStateFromDefaultValue({
    stepFilterSettingState: currentStepFilterGroupsComponentState,
    defaultValue: defaultValue?.stepFilterGroups,
  });

  return null;
};
