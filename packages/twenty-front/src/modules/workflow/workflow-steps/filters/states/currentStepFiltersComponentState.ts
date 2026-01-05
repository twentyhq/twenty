import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFiltersComponentInstanceContext';
import { type StepFilter } from 'twenty-shared/types';

export const currentStepFiltersComponentState = createComponentState<
  StepFilter[]
>({
  key: 'currentStepFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: StepFiltersComponentInstanceContext,
});
