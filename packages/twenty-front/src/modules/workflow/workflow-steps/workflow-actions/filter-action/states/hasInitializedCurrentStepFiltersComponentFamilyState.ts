import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFiltersComponentInstanceContext';

export const hasInitializedCurrentStepFiltersComponentFamilyState =
  createComponentFamilyState<boolean, { stepId: string }>({
    key: 'hasInitializedCurrentStepFiltersComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: StepFiltersComponentInstanceContext,
  });
