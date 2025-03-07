import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { WorkflowVersionComponentInstanceContext } from '@/workflow/states/context/WorkflowVersionComponentInstanceContext';
import { stepsOutputSchemaComponentFamilyState } from '@/workflow/states/stepsOutputSchemaFamilyState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useStepsOutputSchema = ({
  instanceIdFromProps,
}: {
  instanceIdFromProps?: string;
}) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    WorkflowVersionComponentInstanceContext,
    instanceIdFromProps,
  );

  const stepsOutputSchemaFamilyState = useRecoilComponentCallbackStateV2(
    stepsOutputSchemaComponentFamilyState,
    instanceId,
  );

  const getStepsOutputSchema = useRecoilCallback(
    ({ snapshot }) =>
      (stepIds: string[]) => {
        const stepsOutputSchema = stepIds
          .map((stepId) =>
            snapshot
              .getLoadable(stepsOutputSchemaFamilyState(stepId))
              .getValue(),
          )
          .filter(isDefined);

        return stepsOutputSchema;
      },
    [stepsOutputSchemaFamilyState],
  );

  return { getStepsOutputSchema };
};
