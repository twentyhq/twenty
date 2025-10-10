import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
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

    const { triggerDiff, stepsDiff } = workflowVersionStepChanges;

    const { steps: updatedStepsRaw } = applyDiff(
      { steps: cachedRecord.steps },
      stepsDiff,
    );
    const updatedSteps = updatedStepsRaw ?? [];

    const { trigger: updatedTriggerRaw } = applyDiff(
      { trigger: cachedRecord.trigger },
      triggerDiff,
    );
    const updatedTrigger = updatedTriggerRaw ?? null;

    const updatedStepsById = new Map(
      updatedSteps.map((step) => [step.id, step]),
    );

    const collectMissingNextStepIds = (
      nextStepIds: string[] | null | undefined,
    ) => {
      if (!Array.isArray(nextStepIds)) {
        return [];
      }

      return nextStepIds.filter((stepId) => !updatedStepsById.has(stepId));
    };

    const missingNextStepIds = new Set<string>();

    for (const step of updatedSteps) {
      collectMissingNextStepIds(step.nextStepIds).forEach((stepId) =>
        missingNextStepIds.add(stepId),
      );
    }

    collectMissingNextStepIds(updatedTrigger?.nextStepIds).forEach((stepId) =>
      missingNextStepIds.add(stepId),
    );

    if (missingNextStepIds.size > 0) {
      // Inconsistent cache detected: related NextStepId references unknown steps.
      // Evict the workflow version so the next read fetches a consistent snapshot.
      const versionCacheId = apolloCoreClient.cache.identify({
        __typename: cachedRecord.__typename ?? objectMetadataItem.__typename,
        id: cachedRecord.id,
      });

      if (isDefined(versionCacheId)) {
        apolloCoreClient.cache.evict({ id: versionCacheId });
      }

      if (isDefined(cachedRecord.workflowId)) {
        const workflowCacheId = apolloCoreClient.cache.identify({
          __typename: 'Workflow',
          id: cachedRecord.workflowId,
        });

        if (isDefined(workflowCacheId)) {
          apolloCoreClient.cache.evict({ id: workflowCacheId });
        }
      }

      apolloCoreClient.cache.gc();

      return undefined;
    }

    const validStepIds = new Set(updatedSteps.map((step) => step.id));

    const sanitizeNextStepIds = (
      nextStepIds: string[] | null | undefined,
    ): string[] | undefined => {
      if (!Array.isArray(nextStepIds)) {
        return nextStepIds ?? undefined;
      }

      return nextStepIds.filter((stepId) => validStepIds.has(stepId));
    };

    const sanitizedSteps = updatedSteps.map((step) => ({
      ...step,
      nextStepIds: sanitizeNextStepIds(step.nextStepIds),
    }));

    const sanitizedTrigger = isDefined(updatedTrigger)
      ? {
          ...updatedTrigger,
          nextStepIds: sanitizeNextStepIds(updatedTrigger.nextStepIds),
        }
      : updatedTrigger;

    const newCachedRecord = {
      ...cachedRecord,
      steps: sanitizedSteps,
      trigger: sanitizedTrigger,
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
