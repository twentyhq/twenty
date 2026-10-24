import { GET_LOGIC_FUNCTION_SOURCE_CODE } from '@/logic-functions/graphql/queries/getLogicFunctionSourceCode';
import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import { buildWorkflowVersionFromCore } from '@/object-core/workflows/utils/buildWorkflowVersionFromCore';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useApolloClient } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';
import {
  type GetLogicFunctionSourceCodeQuery,
  type GetLogicFunctionSourceCodeQueryVariables,
} from '~/generated-metadata/graphql';

// A draft copies each code step onto a new logic function, so the source must go to that copy
export const useSaveCodeStepSourceToDraft = () => {
  const apolloClient = useApolloClient();
  const apolloCoreClient = useApolloCoreClient();
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();
  const { updateLogicFunction } = usePersistLogicFunction();

  const persistDraftSourceCode = useDebouncedCallback(
    async (logicFunctionId: string, sourceHandlerCode: string) => {
      await updateLogicFunction({
        input: { id: logicFunctionId, update: { sourceHandlerCode } },
      });
    },
    500,
  );

  const saveCodeStepSourceToDraft = async ({
    stepId,
    sourceHandlerCode,
  }: {
    stepId: string;
    sourceHandlerCode: string;
  }) => {
    const draftVersionId = await getUpdatableWorkflowVersion();

    const { data } = await apolloCoreClient.query({
      query: GetCoreWorkflowVersionDocument,
      variables: { coreWorkflowVersionId: draftVersionId },
    });

    const draftStep = buildWorkflowVersionFromCore(
      data?.coreWorkflowVersion,
    )?.steps?.find((step) => step.id === stepId);

    if (!isDefined(draftStep) || draftStep.type !== 'CODE') {
      return;
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

    await persistDraftSourceCode(draftLogicFunctionId, sourceHandlerCode);
  };

  return { saveCodeStepSourceToDraft };
};
