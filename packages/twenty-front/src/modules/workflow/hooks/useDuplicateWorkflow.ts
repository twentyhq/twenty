import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import {
  DuplicateCoreWorkflowDocument,
  type DuplicateWorkflowInput,
  type WorkflowVersionDto,
} from '~/generated/graphql';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useMutation } from '@apollo/client/react';
import { DUPLICATE_WORKFLOW } from '@/workflow/graphql/mutations/duplicateWorkflow';

export const useDuplicateWorkflow = () => {
  const apolloCoreClient = useApolloCoreClient();
  const isCore = useIsWorkflowCoreEnabled();
  const [mutateCore] = useMutation(DuplicateCoreWorkflowDocument, {
    client: apolloCoreClient,
  });
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
    if (isCore) {
      const result = await mutateCore({
        variables: {
          input: {
            coreWorkflowIdToDuplicate: input.workflowIdToDuplicate,
            coreWorkflowVersionIdToCopy: input.workflowVersionIdToCopy,
          },
        },
      });
      await invalidateCoreWorkflowVersions(apolloCoreClient);
      return result.data
        ? { workflowId: result.data.duplicateWorkflow.id }
        : undefined;
    }

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
