import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFilterGroupsComponentInstanceContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/currentStepFilterGroupsComponentState';
import { isDefined } from 'twenty-shared/utils';

export const rootLevelStepFilterGroupComponentSelector =
  createComponentSelectorV2({
    key: 'rootLevelStepFilterGroupComponentSelector',
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const currentStepFilterGroups = get(
          currentStepFilterGroupsComponentState.atomFamily({ instanceId }),
        );

        const rootLevelStepFilterGroup = currentStepFilterGroups.find(
          (stepFilterGroup) =>
            !isDefined(stepFilterGroup.parentStepFilterGroupId),
        );

        return rootLevelStepFilterGroup;
      },
    componentInstanceContext: StepFilterGroupsComponentInstanceContext,
  });
