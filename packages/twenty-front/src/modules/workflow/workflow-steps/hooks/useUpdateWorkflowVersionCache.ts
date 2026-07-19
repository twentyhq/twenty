import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { reportWorkflowVersionCacheDiffMismatch } from '@/workflow/workflow-steps/utils/reportWorkflowVersionCacheDiffMismatch';
import { applyDiff, isDefined } from 'twenty-shared/utils';
import { type WorkflowVersionStepChanges } from '~/generated/graphql';

export const useUpdateWorkflowVersionCache = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const { findOneRecordQuery: findOneWorkflowVersionQuery } =
    useFindOneRecordQuery({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      recordGqlFields: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        workflowId: true,
        trigger: true,
        steps: true,
        status: true,
      },
    });

  const updateWorkflowVersionCache = async ({
    workflowVersionStepChanges,
    workflowVersionId,
  }: {
    workflowVersionStepChanges: WorkflowVersionStepChanges | undefined;
    workflowVersionId: string;
  }): Promise<WorkflowVersion | undefined> => {
    if (!isDefined(workflowVersionStepChanges)) {
      return;
    }

    const cachedRecord = getRecordFromCache<WorkflowVersion>(workflowVersionId);

    if (!isDefined(cachedRecord)) {
      return;
    }

    const { triggerDiff, stepsDiff } = workflowVersionStepChanges;

    let updatedSteps: WorkflowVersion['steps'];
    let updatedTrigger: WorkflowVersion['trigger'];

    try {
      updatedSteps = applyDiff({ steps: cachedRecord.steps }, stepsDiff).steps;
      updatedTrigger = applyDiff(
        { trigger: cachedRecord.trigger },
        triggerDiff,
      ).trigger;
    } catch (error) {
      void reportWorkflowVersionCacheDiffMismatch({
        error,
        workflowVersionId,
        cachedSteps: cachedRecord.steps,
        stepsDiff,
      });

      await apolloCoreClient.query({
        query: findOneWorkflowVersionQuery,
        variables: { objectRecordId: workflowVersionId },
        fetchPolicy: 'network-only',
      });

      return getRecordFromCache<WorkflowVersion>(workflowVersionId);
    }

    const newCachedRecord = {
      ...cachedRecord,
      steps: updatedSteps,
      trigger: updatedTrigger,
    } as WorkflowVersion;

    const recordGqlFields = {
      steps: true,
      trigger: true,
    };

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloCoreClient.cache,
      record: newCachedRecord,
      recordGqlFields,
      objectPermissionsByObjectMetadataId,
    });

    return newCachedRecord;
  };

  return { updateWorkflowVersionCache };
};
