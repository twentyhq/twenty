import { GET_LOGIC_FUNCTION_SOURCE_CODE } from '@/logic-functions/graphql/queries/getLogicFunctionSourceCode';
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
import { useApolloClient } from '@apollo/client/react';
import { isString } from '@sniptt/guards';
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

  const { formValues, setFormValues, logicFunction, loading } =
    useLogicFunctionUpdateFormState({ logicFunctionId });

  const handleSave = useDebouncedCallback(
    async (targetLogicFunctionId: string) => {
      await updateLogicFunction({
        input: {
          id: targetLogicFunctionId,
          update: formValues,
        },
      });
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

      const targetLogicFunctionId = isDefined(getTargetLogicFunctionId)
        ? await getTargetLogicFunctionId()
        : logicFunctionId;

      if (key !== 'sourceHandlerCode' || !isString(value)) {
        await handleSave(targetLogicFunctionId);

        return undefined;
      }

      const sourceHandlerCode = value;

      // The form reloads the target's source once it switches to it, so it must already hold the new code
      if (targetLogicFunctionId !== logicFunctionId) {
        apolloClient.cache.writeQuery<
          GetLogicFunctionSourceCodeQuery,
          GetLogicFunctionSourceCodeQueryVariables
        >({
          query: GET_LOGIC_FUNCTION_SOURCE_CODE,
          variables: { input: { id: targetLogicFunctionId } },
          data: { getLogicFunctionSourceCode: sourceHandlerCode },
        });
      }

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

      await handleSave(targetLogicFunctionId);

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
