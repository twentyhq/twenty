import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';
import { type StepFilterGroup } from 'twenty-shared/types';

export const currentStepFilterGroupsComponentState = createAtomComponentState<
  StepFilterGroup[]
>({
  key: 'currentStepFilterGroupsComponentState',
  defaultValue: [],
  componentInstanceContext: StepFilterGroupsComponentInstanceContext,
});
