import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import {
  WorkflowAction,
  WorkflowVersionStepUpdates,
} from '~/generated/graphql';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';

export const useWorkflowVersionStepUpdateCache = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const updateCache = ({
    workflowVersionStepUpdates,
    workflowVersionId,
  }: {
    workflowVersionStepUpdates: WorkflowVersionStepUpdates | undefined;
    workflowVersionId: string;
  }) => {
    if (!isDefined(workflowVersionStepUpdates)) {
      return;
    }

    const cachedRecord = getRecordFromCache<WorkflowVersion>(workflowVersionId);

    if (!isDefined(cachedRecord)) {
      return;
    }

    const { triggerNextStepIds, stepsNextStepIds, createdStep, deletedStepId } =
      workflowVersionStepUpdates;

    const newCachedRecord = {
      ...cachedRecord,
      trigger: isDefined(cachedRecord.trigger)
        ? {
            ...cachedRecord.trigger,
            nextStepIds: triggerNextStepIds,
          }
        : cachedRecord.trigger,
      steps: (cachedRecord.steps || []).map((step: WorkflowAction) => ({
        ...step,
        nextStepIds: stepsNextStepIds[step.id],
      })),
    };

    if (isDefined(createdStep)) {
      const formattedCreatedStep = {
        ...createdStep,
        nextStepIds: createdStep.nextStepIds || [],
      };

      newCachedRecord.steps.push(formattedCreatedStep);
    }

    if (isDefined(deletedStepId)) {
      newCachedRecord.steps = newCachedRecord.steps.filter(
        (step) => step.id !== deletedStepId,
      );
    }

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
  };

  return { updateCache };
};
