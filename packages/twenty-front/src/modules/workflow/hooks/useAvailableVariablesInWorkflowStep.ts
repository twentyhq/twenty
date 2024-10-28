import { capitalize } from '~/utils/string/capitalize';
import { useRecoilValue } from 'recoil';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowSelectedNodeState } from '@/workflow/states/workflowSelectedNodeState';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { isDefined } from 'twenty-ui';
import { StepOutputSchema } from '@/workflow/search-variables/types/StepOutputSchema';

export const useAvailableVariablesInWorkflowStep = (): StepOutputSchema[] => {
  const workflowId = useRecoilValue(workflowIdState);
  const workflow = useWorkflowWithCurrentVersion(workflowId);
  const workflowSelectedNode = useRecoilValue(workflowSelectedNodeState);

  if (!isDefined(workflowSelectedNode) || !isDefined(workflow)) {
    return [];
  }

  const stepDefinition = getStepDefinitionOrThrow({
    stepId: workflowSelectedNode,
    workflowVersion: workflow.currentVersion,
  });

  if (
    !isDefined(stepDefinition) ||
    stepDefinition.type === 'trigger' ||
    !isDefined(workflow.currentVersion.steps)
  ) {
    return [];
  }

  const previousSteps = [];

  for (const step of workflow.currentVersion.steps) {
    if (step.id === workflowSelectedNode) {
      break;
    }
    previousSteps.push(step);
  }

  const result = [];

  if (
    workflow.currentVersion.trigger?.type === 'DATABASE_EVENT' &&
    isDefined(workflow.currentVersion.trigger?.settings?.outputSchema)
  ) {
    const [object, action] =
      workflow.currentVersion.trigger.settings.eventName.split('.');
    result.push({
      id: 'trigger',
      name: `${capitalize(object)} is ${capitalize(action)}`,
      outputSchema: workflow.currentVersion.trigger.settings.outputSchema,
    });
  }

  previousSteps.forEach((previousStep) => {
    if (isDefined(previousStep.settings.outputSchema)) {
      result.push({
        id: previousStep.id,
        name: previousStep.name,
        outputSchema: previousStep.settings.outputSchema,
      });
    }
  });

  return result;
};
