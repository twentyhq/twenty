import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useAnswerToolCall } from '@/ai/hooks/useAnswerToolCall';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';

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

  // A form step's call is named after the step, in the conversation its
  // current execution recorded. Returns false when the form no longer waits.
  const answerFormStep = async (
    response: Record<string, unknown>,
  ): Promise<boolean> => {
    const threadId = workflowRun?.state?.stepInfos[stepId]?.threadId;

    if (!isDefined(threadId)) {
      return false;
    }

    await answerToolCall({ threadId, toolCallId: stepId, response });

    await apolloCoreClient.query({
      query: findOneWorkflowRunQuery,
      variables: { objectRecordId: workflowRunId },
      fetchPolicy: 'network-only',
    });

    return true;
  };

  return { answerFormStep };
};
