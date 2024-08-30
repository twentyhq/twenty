import { WorkflowStep } from '@/workflow/types/Workflow';

const findStepPositionOrThrow = ({
  steps,
  stepId,
}: {
  steps: Array<WorkflowStep>;
  stepId: string | undefined;
}): { steps: Array<WorkflowStep>; index: number } => {
  if (stepId === undefined) {
    return {
      steps,
      index: 0,
    };
  }

  for (const [index, step] of steps.entries()) {
    if (step.id === stepId) {
      return {
        steps,
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

export const insertStep = ({
  steps: stepsInitial,
  stepToAdd,
  parentStepId,
}: {
  steps: Array<WorkflowStep>;
  parentStepId: string | undefined;
  stepToAdd: WorkflowStep;
}): Array<WorkflowStep> => {
  // Make a deep copy of the nested object to prevent unwanted side effects.
  const steps = structuredClone(stepsInitial);

  const parentStepPosition = findStepPositionOrThrow({
    steps: steps,
    stepId: parentStepId,
  });

  parentStepPosition.steps.splice(
    parentStepPosition.index + 1, // The "+ 1" means that we add the step after its parent and not before.
    0,
    stepToAdd,
  );

  return steps;
};
