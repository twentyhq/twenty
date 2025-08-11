import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import {
  type WorkflowAction,
  type WorkflowVersion,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';
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

  const updateWorkflowVersionCache = ({
    workflowVersionStepChanges,
    workflowVersionId,
  }: {
    workflowVersionStepChanges: WorkflowVersionStepChanges | undefined;
    workflowVersionId: string;
  }): WorkflowVersion | undefined => {
    if (!isDefined(workflowVersionStepChanges)) {
      return;
    }

    const cachedRecord = getRecordFromCache<WorkflowVersion>(workflowVersionId);

    if (!isDefined(cachedRecord)) {
      return;
    }

    const {
      triggerNextStepIds,
      stepsNextStepIds,
      createdStep,
      deletedStepIds,
    } = workflowVersionStepChanges;

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
    } satisfies WorkflowVersion;

    if (isDefined(createdStep)) {
      const formattedCreatedStep = {
        ...(createdStep as WorkflowAction),
        nextStepIds: createdStep.nextStepIds || [],
      };

      newCachedRecord.steps.push(formattedCreatedStep);
    }

    if (isDefined(deletedStepIds) && deletedStepIds.length > 0) {
      newCachedRecord.steps = newCachedRecord.steps.filter(
        (step: WorkflowAction) => !deletedStepIds.includes(step.id),
      );

      const hasDeletedTrigger: boolean = deletedStepIds.includes('trigger');

      if (hasDeletedTrigger) {
        newCachedRecord.trigger = null;
      }
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

    return newCachedRecord;
  };

  return { updateWorkflowVersionCache };
};
