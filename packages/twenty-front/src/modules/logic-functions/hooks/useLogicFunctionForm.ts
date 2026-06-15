import {
  type LogicFunctionFormValues,
  useLogicFunctionUpdateFormState,
} from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useMemo } from 'react';
import {
  buildKnownObjectTypes,
  getInputSchemaFromSourceCode,
  jsonSchemaToInputSchema,
  type InputJsonSchema,
} from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

export const useLogicFunctionForm = ({
  logicFunctionId,
}: {
  logicFunctionId: string;
}) => {
  const { updateLogicFunction } = usePersistLogicFunction();

  const { formValues, setFormValues, logicFunction, loading } =
    useLogicFunctionUpdateFormState({ logicFunctionId });

  const { objectMetadataItems } = useObjectMetadataItems();

  const knownObjectTypes = useMemo(
    () => buildKnownObjectTypes(objectMetadataItems),
    [objectMetadataItems],
  );

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
          { knownObjectTypes },
        );

        // Inference returns undefined when the params type cannot be derived
        // (e.g. an imported alias); keep the stored schemas instead of wiping
        // authored ones. An inferred empty schema still clears stale inputs.
        setFormValues((prevState: LogicFunctionFormValues) => ({
          ...prevState,
          sourceHandlerCode: value as string,
          // Re-infer schemas for any active surface so they stay in sync
          // with the source code.
          toolTriggerSettings: prevState.toolTriggerSettings
            ? {
                ...prevState.toolTriggerSettings,
                inputSchema: isDefined(inferredJsonSchema)
                  ? inferredJsonSchema
                  : prevState.toolTriggerSettings.inputSchema,
              }
            : null,
          workflowActionTriggerSettings: prevState.workflowActionTriggerSettings
            ? {
                ...prevState.workflowActionTriggerSettings,
                inputSchema: isDefined(inferredJsonSchema)
                  ? jsonSchemaToInputSchema(inferredJsonSchema)
                  : prevState.workflowActionTriggerSettings.inputSchema,
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
