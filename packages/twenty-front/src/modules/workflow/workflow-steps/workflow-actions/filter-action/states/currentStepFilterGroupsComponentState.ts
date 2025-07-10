import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFilterGroupsComponentInstanceContext';
import { StepFilterGroup } from 'twenty-shared/types';

export const currentStepFilterGroupsComponentState = createComponentStateV2<
  StepFilterGroup[]
>({
  key: 'currentStepFilterGroupsComponentState',
  defaultValue: [],
  componentInstanceContext: StepFilterGroupsComponentInstanceContext,
});
