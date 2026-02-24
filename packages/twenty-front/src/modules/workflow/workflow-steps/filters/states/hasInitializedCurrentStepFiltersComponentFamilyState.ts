import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFiltersComponentInstanceContext';

export const hasInitializedCurrentStepFiltersComponentFamilyState =
  createComponentFamilyStateV2<boolean, { stepId: string }>({
    key: 'hasInitializedCurrentStepFiltersComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: StepFiltersComponentInstanceContext,
  });
