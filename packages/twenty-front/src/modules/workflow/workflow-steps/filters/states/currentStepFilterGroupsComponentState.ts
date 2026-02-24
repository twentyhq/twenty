import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';
import { type StepFilterGroup } from 'twenty-shared/types';

export const currentStepFilterGroupsComponentState = createComponentStateV2<
  StepFilterGroup[]
>({
  key: 'currentStepFilterGroupsComponentState',
  defaultValue: [],
  componentInstanceContext: StepFilterGroupsComponentInstanceContext,
});
