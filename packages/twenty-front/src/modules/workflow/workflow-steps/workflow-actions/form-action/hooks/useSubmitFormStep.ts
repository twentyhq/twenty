import { useMutation } from '@apollo/client/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { SUBMIT_FORM_STEP } from '@/workflow/graphql/mutations/submitFormStep';
import {
  type SubmitFormStepMutation,
  type SubmitFormStepMutationVariables,
} from '~/generated/graphql';

export const useSubmitFormStep = ({
  workflowRunId,
  stepId,
}: {
  workflowRunId: string;
  stepId: string;
}) => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation<
    SubmitFormStepMutation,
    SubmitFormStepMutationVariables
  >(SUBMIT_FORM_STEP, { client: apolloCoreClient });

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

  const submitFormStep = async (response: Record<string, unknown>) => {
    try {
      await mutate({
        variables: { input: { workflowRunId, stepId, response } },
      });
    } finally {
      await apolloCoreClient.query({
        query: findOneWorkflowRunQuery,
        variables: { objectRecordId: workflowRunId },
        fetchPolicy: 'network-only',
      });
    }
  };

  return { submitFormStep };
};
