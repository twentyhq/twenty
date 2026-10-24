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
import { isString } from '@sniptt/guards';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

type UnsavedSourceHandlerCode = {
  sourceHandlerCode: string;
  targetLogicFunctionId?: string;
};

export const useLogicFunctionForm = ({
  logicFunctionId,
  getTargetLogicFunctionId,
}: {
  logicFunctionId: string;
  getTargetLogicFunctionId?: () => Promise<string>;
}) => {
  const { updateLogicFunction } = usePersistLogicFunction();

  const [unsavedSourceHandlerCode, setUnsavedSourceHandlerCode] =
    useState<UnsavedSourceHandlerCode>();

  // oxlint-disable-next-line twenty/no-state-useref -- Read by in-flight saves, not render state.
  const latestSourceHandlerCodeRef = useRef<string>();

  const { formValues, setFormValues, logicFunction, loading } =
    useLogicFunctionUpdateFormState({
      logicFunctionId,
      shouldKeepSourceHandlerCode:
        isDefined(unsavedSourceHandlerCode) &&
        (!isDefined(unsavedSourceHandlerCode.targetLogicFunctionId) ||
          unsavedSourceHandlerCode.targetLogicFunctionId === logicFunctionId),
    });

  const handleSave = useDebouncedCallback(
    async ({
      targetLogicFunctionId,
      update,
    }: {
      targetLogicFunctionId: string;
      update: LogicFunctionFormValues;
    }) => {
      const result = await updateLogicFunction({
        input: { id: targetLogicFunctionId, update },
      });

      if (result.status !== 'successful') {
        return;
      }

      setUnsavedSourceHandlerCode((currentUnsavedSourceHandlerCode) =>
        currentUnsavedSourceHandlerCode?.sourceHandlerCode ===
        update.sourceHandlerCode
          ? undefined
          : currentUnsavedSourceHandlerCode,
      );
    },
    500,
  );

  const onChange = <TKey extends keyof LogicFunctionFormValues>(key: TKey) => {
    return async (
      value: LogicFunctionFormValues[TKey],
    ): Promise<InputJsonSchema | undefined> => {
      setFormValues((prevState: LogicFunctionFormValues) => ({
        ...prevState,
        [key]: value,
      }));

      const isSourceHandlerCodeChange =
        key === 'sourceHandlerCode' && isString(value);

      if (isSourceHandlerCodeChange) {
        latestSourceHandlerCodeRef.current = value;
        setUnsavedSourceHandlerCode({ sourceHandlerCode: value });
      }

      const targetLogicFunctionId = isDefined(getTargetLogicFunctionId)
        ? await getTargetLogicFunctionId()
        : logicFunctionId;

      if (!isSourceHandlerCodeChange) {
        await handleSave({
          targetLogicFunctionId,
          update: { ...formValues, [key]: value },
        });

        return undefined;
      }

      setUnsavedSourceHandlerCode((currentUnsavedSourceHandlerCode) =>
        currentUnsavedSourceHandlerCode?.sourceHandlerCode === value
          ? { sourceHandlerCode: value, targetLogicFunctionId }
          : currentUnsavedSourceHandlerCode,
      );

      const inferredJsonSchema = await getInputSchemaFromSourceCode(value);

      // Keystrokes queued behind draft creation resume out of order
      if (latestSourceHandlerCodeRef.current !== value) {
        return undefined;
      }

      const triggerSettings = {
        toolTriggerSettings: isDefined(formValues.toolTriggerSettings)
          ? {
              ...formValues.toolTriggerSettings,
              inputSchema: inferredJsonSchema,
            }
          : null,
        workflowActionTriggerSettings: isDefined(
          formValues.workflowActionTriggerSettings,
        )
          ? {
              ...formValues.workflowActionTriggerSettings,
              inputSchema: jsonSchemaToInputSchema(inferredJsonSchema),
            }
          : null,
      };

      setFormValues((prevState: LogicFunctionFormValues) => ({
        ...prevState,
        ...triggerSettings,
      }));

      await handleSave({
        targetLogicFunctionId,
        update: { ...formValues, sourceHandlerCode: value, ...triggerSettings },
      });

      return inferredJsonSchema;
    };
  };

  return {
    formValues,
    setFormValues,
    logicFunction,
    loading,
    onChange,
  };
};
