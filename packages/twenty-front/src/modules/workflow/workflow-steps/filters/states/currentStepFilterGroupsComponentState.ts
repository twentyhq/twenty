import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';
import { type StepFilterGroup } from 'twenty-shared/types';

export const currentStepFilterGroupsComponentState = createComponentState<
  StepFilterGroup[]
>({
  key: 'currentStepFilterGroupsComponentState',
  defaultValue: [],
  componentInstanceContext: StepFilterGroupsComponentInstanceContext,
});
