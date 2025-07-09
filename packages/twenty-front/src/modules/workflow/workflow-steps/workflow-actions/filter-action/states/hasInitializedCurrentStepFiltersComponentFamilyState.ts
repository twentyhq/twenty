import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFiltersComponentInstanceContext';

export const hasInitializedCurrentStepFiltersComponentFamilyState =
  createComponentFamilyStateV2<boolean, { stepId: string }>({
    key: 'hasInitializedCurrentStepFiltersComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: StepFiltersComponentInstanceContext,
  });
