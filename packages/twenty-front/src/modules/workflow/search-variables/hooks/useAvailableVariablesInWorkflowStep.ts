import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { StepOutputSchema } from '@/workflow/search-variables/types/StepOutputSchema';
import { getTriggerStepName } from '@/workflow/search-variables/utils/getTriggerStepName';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowSelectedNodeState } from '@/workflow/states/workflowSelectedNodeState';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import isEmpty from 'lodash.isempty';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';
import { isEmptyObject } from '~/utils/isEmptyObject';

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
    isDefined(workflow.currentVersion.trigger) &&
    isDefined(workflow.currentVersion.trigger?.settings?.outputSchema) &&
    !isEmptyObject(workflow.currentVersion.trigger?.settings?.outputSchema)
  ) {
    result.push({
      id: 'trigger',
      name: getTriggerStepName(workflow.currentVersion.trigger),
      outputSchema: workflow.currentVersion.trigger.settings.outputSchema,
    });
  }

  previousSteps.forEach((previousStep) => {
    if (
      isDefined(previousStep.settings.outputSchema) &&
      !isEmpty(previousStep.settings.outputSchema)
    ) {
      result.push({
        id: previousStep.id,
        name: previousStep.name,
        outputSchema: previousStep.settings.outputSchema,
      });
    }
  });

  return result;
};
