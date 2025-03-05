import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { WorkflowVersionComponentInstanceContext } from '@/workflow/states/context/WorkflowVersionComponentInstanceContext';
import { stepOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepOutputSchemaFamilySelector';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useStepsOutputSchema = (instanceIdFromProps?: string) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    WorkflowVersionComponentInstanceContext,
    instanceIdFromProps,
  );

  const getStepsOutputSchema = useRecoilCallback(
    ({ snapshot }) =>
      (stepIds: string[]) => {
        const stepsOutputSchema = stepIds
          .map((stepId) =>
            snapshot
              .getLoadable(
                stepOutputSchemaFamilySelector.selectorFamily({
                  instanceId,
                  familyKey: stepId,
                }),
              )
              .getValue(),
          )
          .filter(isDefined);

        return stepsOutputSchema;
      },
    [instanceId],
  );

  return { getStepsOutputSchema };
};
