import { type LogicFunctionFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import {
  jsonSchemaToInputSchema,
  type InputJsonSchema,
} from 'twenty-shared/logic-function';

export const getTriggerSettingsWithInputSchema = ({
  toolTriggerSettings,
  workflowActionTriggerSettings,
  inputJsonSchema,
}: Pick<
  LogicFunctionFormValues,
  'toolTriggerSettings' | 'workflowActionTriggerSettings'
> & {
  inputJsonSchema: InputJsonSchema;
}): Pick<
  LogicFunctionFormValues,
  'toolTriggerSettings' | 'workflowActionTriggerSettings'
> => ({
  toolTriggerSettings: toolTriggerSettings
    ? { ...toolTriggerSettings, inputSchema: inputJsonSchema }
    : null,
  workflowActionTriggerSettings: workflowActionTriggerSettings
    ? {
        ...workflowActionTriggerSettings,
        inputSchema: jsonSchemaToInputSchema(inputJsonSchema),
      }
    : null,
});
