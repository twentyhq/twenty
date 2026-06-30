import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useEffectiveDraftVersionId } from '@/workflow/hooks/useEffectiveDraftVersionId';
import {
  type Workflow,
  type WorkflowVersion,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type WorkflowWithAllVersions = Omit<Workflow, 'versions'> & {
  versions: Array<
    Pick<WorkflowVersion, 'id' | 'status' | 'name' | 'createdAt'>
  >;
};

export const useWorkflowWithCurrentVersion = (
  workflowId: string | undefined,
): WorkflowWithCurrentVersion | undefined => {
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
    skip: !isDefined(workflowId),
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
      skip: !isDefined(currentVersionId),
    },
  );

  if (!isDefined(workflow) || !isDefined(currentVersionWithSteps)) {
    return undefined;
  }

  return {
    ...workflow,
    currentVersion: currentVersionWithSteps,
  };
};
