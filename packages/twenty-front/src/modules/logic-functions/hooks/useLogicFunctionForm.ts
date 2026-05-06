import {
  type LogicFunctionFormValues,
  useLogicFunctionUpdateFormState,
} from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import {
  getInputSchemaFromSourceCode,
  jsonSchemaToInputSchema,
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
        const inferredJsonSchema = await getInputSchemaFromSourceCode(
          value as LogicFunctionFormValues['sourceHandlerCode'],
        );

        setFormValues((prevState: LogicFunctionFormValues) => ({
          ...prevState,
          sourceHandlerCode: value as string,
          // Re-infer schemas for any active surface so they stay in sync
          // with the source code.
          toolTriggerSettings: prevState.toolTriggerSettings
            ? {
                ...prevState.toolTriggerSettings,
                inputSchema: inferredJsonSchema,
              }
            : null,
          workflowActionTriggerSettings: prevState.workflowActionTriggerSettings
            ? {
                ...prevState.workflowActionTriggerSettings,
                inputSchema: jsonSchemaToInputSchema(inferredJsonSchema),
              }
            : null,
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
