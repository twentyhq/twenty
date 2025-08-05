import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFiltersComponentInstanceContext';
import { StepFilter } from 'twenty-shared/types';

export const currentStepFiltersComponentState = createComponentState<
  StepFilter[]
>({
  key: 'currentStepFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: StepFiltersComponentInstanceContext,
});
