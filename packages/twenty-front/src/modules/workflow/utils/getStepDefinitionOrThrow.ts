import { WorkflowVersion } from '@/workflow/types/Workflow';
import { findStepPosition } from '@/workflow/utils/findStepPosition';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { isDefined } from 'twenty-ui';

export const getStepDefinitionOrThrow = ({
  stepId,
  workflowVersion,
}: {
  stepId: string;
  workflowVersion: WorkflowVersion;
}) => {
  if (stepId === TRIGGER_STEP_ID) {
    if (!isDefined(workflowVersion.trigger)) {
      return {
        type: 'trigger',
        definition: undefined,
      } as const;
    }

    return {
      type: 'trigger',
      definition: workflowVersion.trigger,
    } as const;
  }

  if (!isDefined(workflowVersion.steps)) {
    throw new Error(
      'Malformed workflow version: missing steps information; be sure to create at least one step before trying to edit one',
    );
  }

  const selectedNodePosition = findStepPosition({
    steps: workflowVersion.steps,
    stepId: stepId,
  });
  if (!isDefined(selectedNodePosition)) {
    return undefined;
  }

  return {
    type: 'action',
    definition: selectedNodePosition.steps[selectedNodePosition.index],
  } as const;
};
