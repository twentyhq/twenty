import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFiltersComponentInstanceContext';

export const hasInitializedCurrentStepFiltersComponentFamilyState =
  createAtomComponentFamilyState<boolean, { stepId: string }>({
    key: 'hasInitializedCurrentStepFiltersComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: StepFiltersComponentInstanceContext,
  });
