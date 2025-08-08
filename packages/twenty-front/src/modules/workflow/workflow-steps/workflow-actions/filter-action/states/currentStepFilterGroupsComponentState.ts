import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFilterGroupsComponentInstanceContext';
import { StepFilterGroup } from 'twenty-shared/types';

export const currentStepFilterGroupsComponentState = createComponentState<
  StepFilterGroup[]
>({
  key: 'currentStepFilterGroupsComponentState',
  defaultValue: [],
  componentInstanceContext: StepFilterGroupsComponentInstanceContext,
});
