import { useExecuteLogicFunction } from '@/logic-functions/hooks/useExecuteLogicFunction';
import {
  type LogicFunctionFormValues,
  useLogicFunctionUpdateFormState,
} from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import {
  getInputSchemaFromSourceCode,
  type InputJsonSchema,
} from 'twenty-shared/logic-function';
import { useDebouncedCallback } from 'use-debounce';

export const useLogicFunctionEditor = ({
  logicFunctionId,
  executeCallback,
}: {
  logicFunctionId: string;
  executeCallback?: (result: object) => void;
}) => {
  const { updateLogicFunction } = usePersistLogicFunction();

  const { formValues, setFormValues, logicFunction, loading } =
    useLogicFunctionUpdateFormState({ logicFunctionId });

  const { executeLogicFunction, isExecuting } = useExecuteLogicFunction({
    logicFunctionId,
    callback: executeCallback,
  });

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
        const toolInputSchema = await getInputSchemaFromSourceCode(
          value as LogicFunctionFormValues['sourceHandlerCode'],
        );

        setFormValues((prevState: LogicFunctionFormValues) => ({
          ...prevState,
          sourceHandlerCode: value as string,
          toolInputSchema,
        }));

        await handleSave();

        return toolInputSchema;
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
    executeLogicFunction,
    isExecuting,
  };
};
