import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

export const useDeleteOneWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
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

    apolloCoreClient.cache.modify({
      id: apolloCoreClient.cache.identify(cachedWorkflow),
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
