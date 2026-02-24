import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';

export const hasInitializedCurrentStepFilterGroupsComponentFamilyState =
  createComponentFamilyStateV2<boolean, { stepId: string }>({
    key: 'hasInitializedCurrentStepFilterGroupsComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: StepFilterGroupsComponentInstanceContext,
  });
