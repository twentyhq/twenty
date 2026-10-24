import { GET_LOGIC_FUNCTION_SOURCE_CODE } from '@/logic-functions/graphql/queries/getLogicFunctionSourceCode';
import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import { type LogicFunctionFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { getTriggerSettingsWithInputSchema } from '@/logic-functions/utils/getTriggerSettingsWithInputSchema';
import { buildWorkflowVersionFromCore } from '@/object-core/workflows/utils/buildWorkflowVersionFromCore';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { useApolloClient } from '@apollo/client/react';
import {
  getInputSchemaFromSourceCode,
  type InputJsonSchema,
} from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';
import {
  type GetLogicFunctionSourceCodeQuery,
  type GetLogicFunctionSourceCodeQueryVariables,
} from '~/generated-metadata/graphql';

type CodeStepSourceUpdate = Pick<
  LogicFunctionFormValues,
  'sourceHandlerCode' | 'toolTriggerSettings' | 'workflowActionTriggerSettings'
>;

// A draft copies each code step onto a new logic function, so the source must go to that copy
export const useSaveCodeStepSourceToDraft = () => {
  const apolloClient = useApolloClient();
  const apolloCoreClient = useApolloCoreClient();
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();
  const { updateLogicFunction } = usePersistLogicFunction();

  const persistDraftLogicFunction = useDebouncedCallback(
    async ({
      logicFunctionId,
      update,
    }: {
      logicFunctionId: string;
      update: CodeStepSourceUpdate;
    }) => {
      await updateLogicFunction({ input: { id: logicFunctionId, update } });
    },
    500,
  );

  const saveCodeStepSourceToDraft = async ({
    stepId,
    sourceHandlerCode,
    toolTriggerSettings,
    workflowActionTriggerSettings,
  }: CodeStepSourceUpdate & { stepId: string }): Promise<
    | { draftStep: WorkflowCodeAction; inferredJsonSchema: InputJsonSchema }
    | undefined
  > => {
    const draftVersionId = await getUpdatableWorkflowVersion();

    const { data } = await apolloCoreClient.query({
      query: GetCoreWorkflowVersionDocument,
      variables: { coreWorkflowVersionId: draftVersionId },
    });

    const draftStep = buildWorkflowVersionFromCore(
      data?.coreWorkflowVersion,
    )?.steps?.find((step) => step.id === stepId);

    if (!isDefined(draftStep) || draftStep.type !== 'CODE') {
      return undefined;
    }

    const draftLogicFunctionId = draftStep.settings.input.logicFunctionId;

    // The editor reloads the copy's source when it switches to the draft
    apolloClient.cache.writeQuery<
      GetLogicFunctionSourceCodeQuery,
      GetLogicFunctionSourceCodeQueryVariables
    >({
      query: GET_LOGIC_FUNCTION_SOURCE_CODE,
      variables: { input: { id: draftLogicFunctionId } },
      data: { getLogicFunctionSourceCode: sourceHandlerCode },
    });

    const inferredJsonSchema =
      await getInputSchemaFromSourceCode(sourceHandlerCode);

    await persistDraftLogicFunction({
      logicFunctionId: draftLogicFunctionId,
      update: {
        sourceHandlerCode,
        ...getTriggerSettingsWithInputSchema({
          toolTriggerSettings,
          workflowActionTriggerSettings,
          inputJsonSchema: inferredJsonSchema,
        }),
      },
    });

    return { draftStep, inferredJsonSchema };
  };

  return { saveCodeStepSourceToDraft };
};
