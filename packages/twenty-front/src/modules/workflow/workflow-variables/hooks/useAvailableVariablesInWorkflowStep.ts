import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import {
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { filterOutputSchema } from '@/workflow/workflow-variables/utils/filterOutputSchema';
import { getTriggerStepName } from '@/workflow/workflow-variables/utils/getTriggerStepName';
import isEmpty from 'lodash.isempty';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { isEmptyObject } from '~/utils/isEmptyObject';

export const useAvailableVariablesInWorkflowStep = ({
  objectNameSingularToSelect,
}: {
  objectNameSingularToSelect?: string;
}): StepOutputSchema[] => {
  const workflowId = useRecoilValue(workflowIdState);
  const workflow = useWorkflowWithCurrentVersion(workflowId);
  const workflowSelectedNode = useRecoilValue(workflowSelectedNodeState);
  const flow = useFlowOrThrow();

  if (!isDefined(workflowSelectedNode) || !isDefined(workflow)) {
    return [];
  }

  const trigger = flow.trigger;
  const steps = flow.steps;

  const stepDefinition = getStepDefinitionOrThrow({
    stepId: workflowSelectedNode,
    trigger,
    steps,
  });

  if (
    !isDefined(stepDefinition) ||
    stepDefinition.type === 'trigger' ||
    !isDefined(steps)
  ) {
    return [];
  }

  const previousSteps = [];

  for (const step of steps) {
    if (step.id === workflowSelectedNode) {
      break;
    }
    previousSteps.push(step);
  }

  const result = [];

  const filteredTriggerOutputSchema = filterOutputSchema(
    trigger?.settings?.outputSchema as OutputSchema | undefined,
    objectNameSingularToSelect,
  );

  if (
    isDefined(trigger) &&
    isDefined(filteredTriggerOutputSchema) &&
    !isEmptyObject(filteredTriggerOutputSchema)
  ) {
    const triggerIconKey =
      trigger.type === 'DATABASE_EVENT'
        ? getTriggerIcon({
            type: trigger.type,
            eventName: splitWorkflowTriggerEventName(
              trigger.settings?.eventName,
            ).event,
          })
        : getTriggerIcon({
            type: trigger.type,
          });

    result.push({
      id: 'trigger',
      name: isDefined(trigger.name)
        ? trigger.name
        : getTriggerStepName(trigger),
      icon: triggerIconKey,
      outputSchema: filteredTriggerOutputSchema,
    });
  }

  previousSteps.forEach((previousStep) => {
    const filteredOutputSchema = filterOutputSchema(
      previousStep.settings.outputSchema as OutputSchema,
      objectNameSingularToSelect,
    );

    if (isDefined(filteredOutputSchema) && !isEmpty(filteredOutputSchema)) {
      result.push({
        id: previousStep.id,
        name: previousStep.name,
        icon: getActionIcon(previousStep.type),
        outputSchema: filteredOutputSchema,
      });
    }
  });

  return result;
};
