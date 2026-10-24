import {
  type LogicFunctionFormValues,
  useLogicFunctionUpdateFormState,
} from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import { buildTriggerSettingsWithInputSchema } from '@/logic-functions/utils/buildTriggerSettingsWithInputSchema';
import {
  getInputSchemaFromSourceCode,
  type InputJsonSchema,
} from 'twenty-shared/logic-function';
import { isString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

type UnsavedSourceHandlerCode = {
  sourceHandlerCode: string;
  targetLogicFunctionId?: string;
};

export const useLogicFunctionForm = ({
  logicFunctionId,
  getTargetLogicFunctionId,
  onSourceHandlerCodeSaved,
}: {
  logicFunctionId: string;
  getTargetLogicFunctionId?: () => Promise<string>;
  onSourceHandlerCodeSaved?: (savedSourceHandlerCode: {
    targetLogicFunctionId: string;
    inferredJsonSchema: InputJsonSchema;
  }) => Promise<void> | void;
}) => {
  const { updateLogicFunction } = usePersistLogicFunction();

  const [unsavedSourceHandlerCode, setUnsavedSourceHandlerCode] =
    useState<UnsavedSourceHandlerCode>();

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
      isSourceHandlerCodeChange = false,
    }: {
      targetLogicFunctionId: string;
      update: LogicFunctionFormValues;
      isSourceHandlerCodeChange?: boolean;
    }) => {
      if (!isSourceHandlerCodeChange) {
        await updateLogicFunction({
          input: { id: targetLogicFunctionId, update },
        });

        return;
      }

      // Not per keystroke: concurrent dynamic imports resolve out of order
      const inferredJsonSchema = await getInputSchemaFromSourceCode(
        update.sourceHandlerCode,
      );

      const triggerSettings = buildTriggerSettingsWithInputSchema({
        formValues: update,
        inferredJsonSchema,
      });

      setFormValues((prevState: LogicFunctionFormValues) => ({
        ...prevState,
        ...triggerSettings,
      }));

      const result = await updateLogicFunction({
        input: {
          id: targetLogicFunctionId,
          update: { ...update, ...triggerSettings },
        },
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

      await onSourceHandlerCodeSaved?.({
        targetLogicFunctionId,
        inferredJsonSchema,
      });
    },
    500,
  );

  const onChange = <TKey extends keyof LogicFunctionFormValues>(key: TKey) => {
    return async (value: LogicFunctionFormValues[TKey]) => {
      setFormValues((prevState: LogicFunctionFormValues) => ({
        ...prevState,
        [key]: value,
      }));

      const isSourceHandlerCodeChange =
        key === 'sourceHandlerCode' && isString(value);

      if (isSourceHandlerCodeChange) {
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

        return;
      }

      setUnsavedSourceHandlerCode((currentUnsavedSourceHandlerCode) =>
        currentUnsavedSourceHandlerCode?.sourceHandlerCode === value
          ? { sourceHandlerCode: value, targetLogicFunctionId }
          : currentUnsavedSourceHandlerCode,
      );

      await handleSave({
        targetLogicFunctionId,
        update: { ...formValues, sourceHandlerCode: value },
        isSourceHandlerCodeChange,
      });
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
