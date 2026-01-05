import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';

export const hasInitializedCurrentStepFilterGroupsComponentFamilyState =
  createComponentFamilyState<boolean, { stepId: string }>({
    key: 'hasInitializedCurrentStepFilterGroupsComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: StepFilterGroupsComponentInstanceContext,
  });
