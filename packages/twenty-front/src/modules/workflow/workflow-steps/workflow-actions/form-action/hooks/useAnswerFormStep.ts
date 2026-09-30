import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useAnswerToolCall } from '@/ai/hooks/useAnswerToolCall';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { SUBMIT_FORM_STEP } from '@/workflow/graphql/mutations/submitFormStep';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import {
  type SubmitFormStepMutation,
  type SubmitFormStepMutationVariables,
} from '~/generated/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const useAnswerFormStep = ({
  workflowRunId,
  stepId,
}: {
  workflowRunId: string;
  stepId: string;
}) => {
  const apolloCoreClient = useApolloCoreClient();
  const workflowRun = useWorkflowRun({ workflowRunId });
  const { answerToolCall } = useAnswerToolCall();

  const { findOneRecordQuery: findOneWorkflowRunQuery } = useFindOneRecordQuery(
    {
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
      recordGqlFields: {
        id: true,
        name: true,
        status: true,
        startedAt: true,
        endedAt: true,
      },
    },
  );

  const refetchWorkflowRun = () =>
    apolloCoreClient.query({
      query: findOneWorkflowRunQuery,
      variables: { objectRecordId: workflowRunId },
      fetchPolicy: 'network-only',
    });

  // Forms started before conversations are available still have the run and step IDs.
  const answerFormStep = async (
    response: Record<string, unknown>,
  ): Promise<boolean> => {
    try {
      const threadId = workflowRun?.state?.stepInfos[stepId]?.threadId;

      if (isDefined(threadId)) {
        await answerToolCall({ threadId, toolCallId: stepId, response });
      } else {
        await apolloCoreClient.mutate<
          SubmitFormStepMutation,
          SubmitFormStepMutationVariables
        >({
          mutation: SUBMIT_FORM_STEP,
          variables: { input: { workflowRunId, stepId, response } },
        });
      }
    } catch (error) {
      if (!isGraphqlErrorOfType(error, AiChatErrorCode.TOOL_CALL_NOT_PENDING)) {
        throw error;
      }

      await refetchWorkflowRun();

      return false;
    }

    await refetchWorkflowRun();

    return true;
  };

  return { answerFormStep };
};
