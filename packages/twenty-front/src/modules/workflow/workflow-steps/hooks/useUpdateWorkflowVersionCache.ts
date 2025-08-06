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
  WorkflowVersionStepChanges,
} from '~/generated/graphql';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';

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

  const updateWorkflowVersionCache = ({
    workflowVersionStepChanges,
    workflowVersionId,
  }: {
    workflowVersionStepChanges: WorkflowVersionStepChanges | undefined;
    workflowVersionId: string;
  }) => {
    if (!isDefined(workflowVersionStepChanges)) {
      return;
    }

    const cachedRecord = getRecordFromCache<WorkflowVersion>(workflowVersionId);

    if (!isDefined(cachedRecord)) {
      return;
    }

    const { triggerNextStepIds, stepsNextStepIds, createdStep, deletedStepId } =
      workflowVersionStepChanges;

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
        nextStepIds: stepsNextStepIds[step.id] ?? step.nextStepIds,
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

  return { updateWorkflowVersionCache };
};
