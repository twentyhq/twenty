import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';

export const hasInitializedCurrentStepFilterGroupsComponentFamilyState =
  createAtomComponentFamilyState<boolean, { stepId: string }>({
    key: 'hasInitializedCurrentStepFilterGroupsComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: StepFilterGroupsComponentInstanceContext,
  });
