import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFiltersComponentInstanceContext';
import { type StepFilter } from 'twenty-shared/types';

export const currentStepFiltersComponentState = createAtomComponentState<
  StepFilter[]
>({
  key: 'currentStepFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: StepFiltersComponentInstanceContext,
});
