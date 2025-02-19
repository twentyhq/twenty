import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';
import { useApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared';

export const useDeleteOneWorkflowVersion = () => {
  const apolloClient = useApolloClient();
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const getWorkflowVersionFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const getWorkflowFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const deleteOneWorkflowVersion = async ({
    workflowVersionId,
  }: {
    workflowVersionId: string;
  }) => {
    await deleteOneRecord(workflowVersionId);

    const cachedWorkflowVersion =
      getWorkflowVersionFromCache<WorkflowVersion>(workflowVersionId);

    if (!isDefined(cachedWorkflowVersion)) {
      return;
    }

    const cachedWorkflow = getWorkflowFromCache<Workflow>(
      cachedWorkflowVersion.workflowId,
    );

    if (!isDefined(cachedWorkflow)) {
      return;
    }

    apolloClient.cache.modify({
      id: apolloClient.cache.identify(cachedWorkflow),
      fields: {
        versions: () => {
          return cachedWorkflow.versions.filter(
            (version) => version.id !== workflowVersionId,
          );
        },
      },
    });
  };

  return { deleteOneWorkflowVersion };
};
