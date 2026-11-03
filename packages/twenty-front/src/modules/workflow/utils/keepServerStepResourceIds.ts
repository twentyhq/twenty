import { type WorkflowAction } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

// Draft creation copies a legacy step's logic function, so the server id must win over a local edit
export const keepServerStepResourceIds = ({
  localStep,
  serverStep,
}: {
  localStep: WorkflowAction;
  serverStep: WorkflowAction;
}): WorkflowAction =>
  localStep.type === 'CODE' &&
  serverStep.type === 'CODE' &&
  !isDefined(localStep.settings.input.code) &&
  !isDefined(serverStep.settings.input.code)
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
