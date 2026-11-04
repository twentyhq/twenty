import { type WorkflowAction } from '@/workflow/types/Workflow';

export const keepServerStepResourceIds = ({
  localStep,
  serverStep,
}: {
  localStep: WorkflowAction;
  serverStep: WorkflowAction;
}): WorkflowAction =>
  localStep.type === 'CODE' && serverStep.type === 'CODE'
    ? {
        ...localStep,
        settings: {
          ...localStep.settings,
          input: {
            ...localStep.settings.input,
            logicFunctionId: serverStep.settings.input.logicFunctionId,
          },
        },
      }
    : localStep;
