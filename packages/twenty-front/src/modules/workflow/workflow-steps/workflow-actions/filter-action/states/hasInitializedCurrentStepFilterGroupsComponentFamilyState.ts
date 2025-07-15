import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFilterGroupsComponentInstanceContext';

export const hasInitializedCurrentStepFilterGroupsComponentFamilyState =
  createComponentFamilyStateV2<boolean, { stepId: string }>({
    key: 'hasInitializedCurrentStepFilterGroupsComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: StepFilterGroupsComponentInstanceContext,
  });
