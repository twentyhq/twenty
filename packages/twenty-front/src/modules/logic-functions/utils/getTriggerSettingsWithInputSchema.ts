import { type LogicFunctionFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import {
  jsonSchemaToInputSchema,
  type InputJsonSchema,
} from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';

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
  toolTriggerSettings: isDefined(toolTriggerSettings)
    ? { ...toolTriggerSettings, inputSchema: inputJsonSchema }
    : null,
  workflowActionTriggerSettings: isDefined(workflowActionTriggerSettings)
    ? {
        ...workflowActionTriggerSettings,
        inputSchema: jsonSchemaToInputSchema(inputJsonSchema),
      }
    : null,
});
