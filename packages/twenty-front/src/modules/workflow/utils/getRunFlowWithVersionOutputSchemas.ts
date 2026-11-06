import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

// a run stores its steps without schemas; its version's read computes them, whatever delivered the run
export const getRunFlowWithVersionOutputSchemas = ({
  runFlow,
  version,
}: {
  runFlow: { trigger: WorkflowTrigger; steps: WorkflowAction[] };
  version: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  };
}): { trigger: WorkflowTrigger; steps: WorkflowAction[] } => {
  const trigger = { ...runFlow.trigger };

  if (isDefined(version.trigger)) {
    trigger.settings = {
      ...trigger.settings,
      outputSchema: version.trigger.settings.outputSchema,
    };
  }

  const steps = runFlow.steps.map((runStep) => {
    const versionStep = version.steps?.find(({ id }) => id === runStep.id);

    if (!isDefined(versionStep)) {
      return runStep;
    }

    const step = { ...runStep };

    step.settings = {
      ...step.settings,
      outputSchema: versionStep.settings.outputSchema,
    };

    return step;
  });

  return { trigger, steps };
};
