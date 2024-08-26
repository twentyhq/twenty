import { WorkflowStep, WorkflowVersion } from '@/workflow/types/Workflow';

const findStepPosition = ({
  workflowSteps,
  stepId,
}: {
  workflowSteps: Array<WorkflowStep>;
  stepId: string | undefined;
}): { workflowSteps: Array<WorkflowStep>; index: number } => {
  if (stepId === undefined) {
    return {
      workflowSteps,
      index: 0,
    };
  }

  for (const [index, step] of workflowSteps.entries()) {
    if (step.id === stepId) {
      return {
        workflowSteps,
        index,
      };
    }

    // TODO: When condition will have been implemented, put recursivity here.
    // if (step.type === "CONDITION") {
    //     return findNodePosition({
    //         workflowSteps: step.conditions,
    //         stepId,
    //     })
    // }
  }

  throw new Error(`Couldn't locate the step. Unreachable step id: ${stepId}.`);
};

/**
 * **Returns a shallow copy of the workflow version.**
 */
export const addStepToWorkflowVersion = ({
  workflowVersion,
  nodeToAdd,
  parentNodeId,
}: {
  workflowVersion: WorkflowVersion;
  parentNodeId: string | undefined;
  nodeToAdd: WorkflowStep;
}): WorkflowVersion => {
  // Make a deep copy of the nested object to prevent unwanted side effects.
  const versionToUpdate: WorkflowVersion = JSON.parse(
    JSON.stringify(workflowVersion),
  );

  const parentStepPosition = findStepPosition({
    workflowSteps: versionToUpdate.steps,
    stepId: parentNodeId,
  });

  /**
   * Add the step at a specific position in the array.
   * This will be useful when we'll want to add a node in the middle of a workflow.
   */
  parentStepPosition.workflowSteps.splice(
    parentStepPosition.index + 1, // The "+ 1" means that we add the step after its parent and not before.
    0,
    nodeToAdd,
  );

  return {
    ...versionToUpdate,
    steps: versionToUpdate.steps,
  };
};
