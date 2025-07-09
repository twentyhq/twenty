import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFiltersComponentInstanceContext';
import { StepFilter } from 'twenty-shared/types';

export const currentStepFiltersComponentState = createComponentStateV2<
  StepFilter[]
>({
  key: 'currentStepFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: StepFiltersComponentInstanceContext,
});
