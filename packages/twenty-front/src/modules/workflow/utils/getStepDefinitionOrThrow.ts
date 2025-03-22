import { WorkflowAction, WorkflowTrigger } from '@/workflow/types/Workflow';
import { findStepPosition } from '@/workflow/utils/findStepPosition';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { isDefined } from 'twenty-shared/utils';

export const getStepDefinitionOrThrow = ({
  stepId,
  trigger,
  steps,
}: {
  stepId: string;
  trigger: WorkflowTrigger | null;
  steps: Array<WorkflowAction> | null;
}) => {
  if (stepId === TRIGGER_STEP_ID) {
    if (!isDefined(trigger)) {
      return {
        type: 'trigger',
        definition: undefined,
      } as const;
    }

    return {
      type: 'trigger',
      definition: trigger,
    } as const;
  }

  if (!isDefined(steps)) {
    throw new Error(
      'Malformed workflow version: missing steps information; be sure to create at least one step before trying to edit one',
    );
  }

  const selectedNodePosition = findStepPosition({
    steps,
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
