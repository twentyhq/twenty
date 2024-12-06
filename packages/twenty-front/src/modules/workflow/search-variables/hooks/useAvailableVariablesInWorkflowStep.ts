import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import {
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/search-variables/types/StepOutputSchema';
import { filterOutputSchema } from '@/workflow/search-variables/utils/filterOutputSchema';
import { getTriggerStepName } from '@/workflow/search-variables/utils/getTriggerStepName';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowSelectedNodeState } from '@/workflow/states/workflowSelectedNodeState';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import isEmpty from 'lodash.isempty';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';
import { isEmptyObject } from '~/utils/isEmptyObject';

export const useAvailableVariablesInWorkflowStep = ({
  objectNameSingularToSelect,
}: {
  objectNameSingularToSelect?: string;
}): StepOutputSchema[] => {
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

  const filteredTriggerOutputSchema = filterOutputSchema(
    workflow.currentVersion.trigger?.settings?.outputSchema as
      | OutputSchema
      | undefined,
    objectNameSingularToSelect,
  );

  if (
    isDefined(workflow.currentVersion.trigger) &&
    isDefined(filteredTriggerOutputSchema) &&
    !isEmptyObject(filteredTriggerOutputSchema)
  ) {
    result.push({
      id: 'trigger',
      name: isDefined(workflow.currentVersion.trigger.name)
        ? workflow.currentVersion.trigger.name
        : getTriggerStepName(workflow.currentVersion.trigger),
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
        outputSchema: filteredOutputSchema,
      });
    }
  });

  return result;
};
