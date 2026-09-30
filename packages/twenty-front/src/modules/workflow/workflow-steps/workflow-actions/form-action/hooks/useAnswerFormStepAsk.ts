import { useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useAnswerAsk } from '@/input-ask/hooks/useAnswerAsk';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';

export const useAnswerFormStepAsk = ({
  workflowRunId,
  stepId,
}: {
  workflowRunId: string;
  stepId: string;
}) => {
  const apolloCoreClient = useApolloCoreClient();
  const { answerAsk } = useAnswerAsk();

  // A form step's Ask is the one of its run and step that no tool call
  // opened; an agent step's questions are answered from its conversation.
  const filter = useMemo(
    () => ({
      workflowRunId: { eq: workflowRunId },
      stepId: { eq: stepId },
      toolCallId: { is: 'NULL' as const },
      status: { in: ['PENDING'] },
    }),
    [workflowRunId, stepId],
  );

  const { findManyRecordsLazy } = useLazyFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.InputAsk,
    filter,
    limit: 1,
    recordGqlFields: { id: true },
    fetchPolicy: 'network-only',
  });

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

  // Returns whether the form was submitted: false when it no longer waits.
  const answerFormStepAsk = async (
    response: Record<string, unknown>,
  ): Promise<boolean> => {
    const { records } = await findManyRecordsLazy();
    const formStepAsk = records?.[0];

    if (!isDefined(formStepAsk)) {
      return false;
    }

    await answerAsk({ askId: formStepAsk.id, response });

    await apolloCoreClient.query({
      query: findOneWorkflowRunQuery,
      variables: { objectRecordId: workflowRunId },
      fetchPolicy: 'network-only',
    });

    return true;
  };

  return { answerFormStepAsk };
};
