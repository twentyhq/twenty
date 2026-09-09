import { useCoreWorkflowWithCurrentVersion } from '@/object-core/workflows/hooks/useCoreWorkflowWithCurrentVersion';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useEffectiveDraftVersionId } from '@/workflow/hooks/useEffectiveDraftVersionId';
import {
  type Workflow,
  type WorkflowVersion,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type WorkflowWithAllVersions = Omit<Workflow, 'versions'> & {
  versions: Array<
    Pick<WorkflowVersion, 'id' | 'status' | 'name' | 'createdAt'>
  >;
};

export const useWorkflowWithCurrentVersion = (
  workflowId: string | undefined,
): WorkflowWithCurrentVersion | undefined => {
  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const { record: workflow } = useFindOneRecord<WorkflowWithAllVersions>({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    objectRecordId: workflowId,
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
    skip: !isDefined(workflowId) || isWorkflowCoreIndexPageEnabled,
  });

  const draftVersionFromServer = workflow?.versions.find(
    (workflowVersion) => workflowVersion.status === 'DRAFT',
  );

  const { effectiveDraftId, lastDiscardedDraftId } = useEffectiveDraftVersionId(
    draftVersionFromServer,
  );

  const workflowVersions = [...(workflow?.versions ?? [])]
    .filter((version) => version.id !== lastDiscardedDraftId)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  const latestVersion = workflowVersions[0];

  const currentVersionId = effectiveDraftId ?? latestVersion?.id;

  const { record: currentVersionWithSteps } = useFindOneRecord<WorkflowVersion>(
    {
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      objectRecordId: currentVersionId,
      recordGqlFields: {
        id: true,
        name: true,
        status: true,
        workflowId: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: !isDefined(currentVersionId) || isWorkflowCoreIndexPageEnabled,
    },
  );

  const coreWorkflowWithCurrentVersion = useCoreWorkflowWithCurrentVersion({
    workspaceWorkflowId: workflowId,
    skip: !isWorkflowCoreIndexPageEnabled,
    getEffectiveDraftId: useEffectiveDraftVersionId,
  });

  if (isWorkflowCoreIndexPageEnabled) {
    return coreWorkflowWithCurrentVersion;
  }

  if (!isDefined(workflow) || !isDefined(currentVersionWithSteps)) {
    return undefined;
  }

  return {
    ...workflow,
    currentVersion: currentVersionWithSteps,
  };
};
