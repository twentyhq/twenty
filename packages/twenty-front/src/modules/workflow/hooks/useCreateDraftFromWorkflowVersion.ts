import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useMutation } from '@apollo/client/react';
import {
  type CreateDraftFromWorkflowVersionInput,
  CreateDraftFromWorkflowVersionDocument,
} from '~/generated/graphql';

export const useCreateDraftFromWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();

  const [mutate] = useMutation(CreateDraftFromWorkflowVersionDocument, {
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
        versions: {
          id: true,
          status: true,
          name: true,
          createdAt: true,
        },
      },
    });

  const createDraftFromWorkflowVersion = async (
    input: CreateDraftFromWorkflowVersionInput,
  ) => {
    const result = await mutate({
      variables: { input },
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: findManyWorkflowsQuery,
          variables: {
            id: input.workflowId,
          },
        },
      ],
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);

    return result?.data?.createDraftFromWorkflowVersion.id;
  };

  return {
    createDraftFromWorkflowVersion,
  };
};
