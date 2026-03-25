import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { type StepFilterGroup } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const rootLevelStepFilterGroupComponentSelector =
  createAtomComponentSelector<StepFilterGroup | undefined>({
    key: 'rootLevelStepFilterGroupComponentSelector',
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const currentStepFilterGroups = get(
          currentStepFilterGroupsComponentState,
          { instanceId },
        );

        const rootLevelStepFilterGroup = currentStepFilterGroups.find(
          (stepFilterGroup) =>
            !isDefined(stepFilterGroup.parentStepFilterGroupId),
        );

        return rootLevelStepFilterGroup;
      },
    componentInstanceContext: StepFilterGroupsComponentInstanceContext,
  });
