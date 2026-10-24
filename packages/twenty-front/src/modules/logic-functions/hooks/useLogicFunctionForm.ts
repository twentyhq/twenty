import { GET_LOGIC_FUNCTION_SOURCE_CODE } from '@/logic-functions/graphql/queries/getLogicFunctionSourceCode';
import {
  type LogicFunctionFormValues,
  useLogicFunctionUpdateFormState,
} from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import { getTriggerSettingsWithInputSchema } from '@/logic-functions/utils/getTriggerSettingsWithInputSchema';
import {
  shouldKeepUnsavedSourceHandlerCode,
  type UnsavedSourceHandlerCode,
} from '@/logic-functions/utils/shouldKeepUnsavedSourceHandlerCode';
import {
  getInputSchemaFromSourceCode,
  type InputJsonSchema,
} from 'twenty-shared/logic-function';
import { useApolloClient } from '@apollo/client/react';
import { isString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import {
  type GetLogicFunctionSourceCodeQuery,
  type GetLogicFunctionSourceCodeQueryVariables,
} from '~/generated-metadata/graphql';

export const useLogicFunctionForm = ({
  logicFunctionId,
  getTargetLogicFunctionId,
}: {
  logicFunctionId: string;
  getTargetLogicFunctionId?: () => Promise<string>;
}) => {
  const apolloClient = useApolloClient();
  const { updateLogicFunction } = usePersistLogicFunction();

  const [unsavedSourceHandlerCode, setUnsavedSourceHandlerCode] =
    useState<UnsavedSourceHandlerCode>();

  const { formValues, setFormValues, logicFunction, loading } =
    useLogicFunctionUpdateFormState({
      logicFunctionId,
      shouldKeepSourceHandlerCode: shouldKeepUnsavedSourceHandlerCode({
        unsavedSourceHandlerCode,
        logicFunctionId,
      }),
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

      apolloClient.cache.writeQuery<
        GetLogicFunctionSourceCodeQuery,
        GetLogicFunctionSourceCodeQueryVariables
      >({
        query: GET_LOGIC_FUNCTION_SOURCE_CODE,
        variables: { input: { id: targetLogicFunctionId } },
        data: { getLogicFunctionSourceCode: update.sourceHandlerCode },
      });

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

      const triggerSettings = getTriggerSettingsWithInputSchema({
        toolTriggerSettings: formValues.toolTriggerSettings,
        workflowActionTriggerSettings: formValues.workflowActionTriggerSettings,
        inputJsonSchema: inferredJsonSchema,
      });

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
