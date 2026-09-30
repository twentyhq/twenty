import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useAnswerToolCall } from '@/ai/hooks/useAnswerToolCall';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
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

  // A form step's call is named after the step, in the conversation its
  // current execution recorded. Returns false when the form no longer waits:
  // it has no conversation, or someone answered it or the run ended first.
  const answerFormStep = async (
    response: Record<string, unknown>,
  ): Promise<boolean> => {
    const threadId = workflowRun?.state?.stepInfos[stepId]?.threadId;

    if (!isDefined(threadId)) {
      return false;
    }

    try {
      await answerToolCall({ threadId, toolCallId: stepId, response });
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
