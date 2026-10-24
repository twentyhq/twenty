import {
  type WorkflowAction,
  type WorkflowAiAgentAction,
  type WorkflowCodeAction,
} from '@/workflow/types/Workflow';

const withStepInput = <
  TStep extends WorkflowCodeAction | WorkflowAiAgentAction,
>(
  step: TStep,
  input: Partial<TStep['settings']['input']>,
): TStep => ({
  ...step,
  settings: {
    ...step.settings,
    input: { ...step.settings.input, ...input },
  },
});

// A draft gives code and AI agent steps their own logic function and agent, which local edits must not replace
export const keepServerStepResourceIds = ({
  localStep,
  serverStep,
}: {
  localStep: WorkflowAction;
  serverStep: WorkflowAction;
}): WorkflowAction => {
  if (localStep.type === 'CODE' && serverStep.type === 'CODE') {
    return withStepInput(localStep, {
      logicFunctionId: serverStep.settings.input.logicFunctionId,
    });
  }

  if (localStep.type === 'AI_AGENT' && serverStep.type === 'AI_AGENT') {
    return withStepInput(localStep, {
      agentId: serverStep.settings.input.agentId,
    });
  }

  return localStep;
};
