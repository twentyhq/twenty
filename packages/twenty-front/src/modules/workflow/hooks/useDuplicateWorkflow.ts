import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useMutation } from '@apollo/client';
import {
  type DuplicateWorkflowInput,
  type WorkflowVersionDto,
} from '~/generated/graphql';
import { DUPLICATE_WORKFLOW } from '@/workflow/graphql/mutations/duplicateWorkflow';

export const useDuplicateWorkflow = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation<
    { duplicateWorkflow: WorkflowVersionDto },
    { input: DuplicateWorkflowInput }
  >(DUPLICATE_WORKFLOW, {
    client: apolloCoreClient,
  });

  const { findManyRecordsQuery: findManyWorkflowsQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: CoreObjectNameSingular.Workflow,
      recordGqlFields: {
        id: true,
        name: true,
        statuses: true,
        lastPublishedVersionId: true,
        versions: true,
      },
    });

  const duplicateWorkflow = async (input: DuplicateWorkflowInput) => {
    const result = await mutate({
      variables: { input },
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: findManyWorkflowsQuery,
          variables: {},
        },
      ],
    });

    return result?.data?.duplicateWorkflow;
  };

  return {
    duplicateWorkflow,
  };
};
