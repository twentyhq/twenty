import { type WorkflowAction } from '@/workflow/types/Workflow';

// A draft gives code and AI agent steps their own logic function and agent, which local edits must not replace
export const keepServerStepResourceIds = ({
  localStep,
  serverStep,
}: {
  localStep: WorkflowAction;
  serverStep: WorkflowAction;
}): WorkflowAction => {
  if (localStep.type === 'CODE' && serverStep.type === 'CODE') {
    return {
      ...localStep,
      settings: {
        ...localStep.settings,
        input: {
          ...localStep.settings.input,
          logicFunctionId: serverStep.settings.input.logicFunctionId,
        },
      },
    };
  }

  if (localStep.type === 'AI_AGENT' && serverStep.type === 'AI_AGENT') {
    return {
      ...localStep,
      settings: {
        ...localStep.settings,
        input: {
          ...localStep.settings.input,
          agentId: serverStep.settings.input.agentId,
        },
      },
    };
  }

  return localStep;
};
