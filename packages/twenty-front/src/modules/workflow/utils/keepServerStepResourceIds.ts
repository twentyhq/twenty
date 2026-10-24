import {
  type WorkflowAction,
  type WorkflowAiAgentAction,
  type WorkflowCodeAction,
} from '@/workflow/types/Workflow';

const withStepInput = <
  TStep extends WorkflowCodeAction | WorkflowAiAgentAction,
>({
  step,
  input,
}: {
  step: TStep;
  input: Partial<TStep['settings']['input']>;
}): TStep => ({
  ...step,
  settings: {
    ...step.settings,
    input: { ...step.settings.input, ...input },
  },
});

export const keepServerStepResourceIds = ({
  localStep,
  serverStep,
}: {
  localStep: WorkflowAction;
  serverStep: WorkflowAction;
}): WorkflowAction => {
  if (localStep.type === 'CODE' && serverStep.type === 'CODE') {
    return withStepInput({
      step: localStep,
      input: { logicFunctionId: serverStep.settings.input.logicFunctionId },
    });
  }

  if (localStep.type === 'AI_AGENT' && serverStep.type === 'AI_AGENT') {
    return withStepInput({
      step: localStep,
      input: { agentId: serverStep.settings.input.agentId },
    });
  }

  return localStep;
};
