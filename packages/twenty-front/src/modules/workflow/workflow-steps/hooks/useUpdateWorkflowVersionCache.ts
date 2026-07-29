import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { applyDiff, isDefined } from 'twenty-shared/utils';
import { type WorkflowVersionStepChanges } from '~/generated/graphql';

export const useUpdateWorkflowVersionCache = (instanceId?: string) => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);

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

    const { triggerDiff, stepsDiff } = workflowVersionStepChanges;

    // the flow atom is the builder's source of truth; apply the diff to it
    // directly so it does not depend on the record being cached
    setFlow((currentFlow) => {
      if (
        !isDefined(currentFlow) ||
        currentFlow.workflowVersionId !== workflowVersionId
      ) {
        return currentFlow;
      }

      return {
        workflowVersionId,
        trigger: applyDiff({ trigger: currentFlow.trigger }, triggerDiff)
          .trigger,
        steps: applyDiff({ steps: currentFlow.steps }, stepsDiff).steps,
      };
    });

    // record-cache write kept while trigger/steps still live on the record
    const cachedRecord = getRecordFromCache<WorkflowVersion>(workflowVersionId);

    if (!isDefined(cachedRecord)) {
      return;
    }

    const newCachedRecord = {
      ...cachedRecord,
      steps: applyDiff({ steps: cachedRecord.steps }, stepsDiff).steps,
      trigger: applyDiff({ trigger: cachedRecord.trigger }, triggerDiff)
        .trigger,
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
