import {
  type LogicFunctionFormValues,
  useLogicFunctionUpdateFormState,
} from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import { getTriggerSettingsWithInputSchema } from '@/logic-functions/utils/getTriggerSettingsWithInputSchema';
import {
  getInputSchemaFromSourceCode,
  type InputJsonSchema,
} from 'twenty-shared/logic-function';
import { useDebouncedCallback } from 'use-debounce';

export const useLogicFunctionForm = ({
  logicFunctionId,
}: {
  logicFunctionId: string;
}) => {
  const { updateLogicFunction } = usePersistLogicFunction();

  const { formValues, setFormValues, logicFunction, loading } =
    useLogicFunctionUpdateFormState({ logicFunctionId });

  const handleSave = useDebouncedCallback(async () => {
    await updateLogicFunction({
      input: {
        id: logicFunctionId,
        update: formValues,
      },
    });
  }, 500);

  const onChange = <TKey extends keyof LogicFunctionFormValues>(key: TKey) => {
    return async (
      value: LogicFunctionFormValues[TKey],
    ): Promise<InputJsonSchema | undefined> => {
      if (key === 'sourceHandlerCode') {
        const sourceHandlerCode =
          value as LogicFunctionFormValues['sourceHandlerCode'];

        setFormValues((prevState: LogicFunctionFormValues) => ({
          ...prevState,
          sourceHandlerCode,
        }));

        const inferredJsonSchema =
          await getInputSchemaFromSourceCode(sourceHandlerCode);

        setFormValues((prevState: LogicFunctionFormValues) => ({
          ...prevState,
          ...getTriggerSettingsWithInputSchema({
            toolTriggerSettings: prevState.toolTriggerSettings,
            workflowActionTriggerSettings:
              prevState.workflowActionTriggerSettings,
            inputJsonSchema: inferredJsonSchema,
          }),
        }));

        await handleSave();

        return inferredJsonSchema;
      }

      setFormValues((prevState: LogicFunctionFormValues) => ({
        ...prevState,
        [key]: value,
      }));

      await handleSave();

      return undefined;
    };
  };

  return {
    formValues,
    setFormValues,
    logicFunction,
    loading,
    handleSave,
    onChange,
  };
};
