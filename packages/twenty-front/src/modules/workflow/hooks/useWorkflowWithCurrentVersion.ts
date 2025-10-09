import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import {
  type Workflow,
  type WorkflowVersion,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowWithCurrentVersion = (
  workflowId: string | undefined,
): WorkflowWithCurrentVersion | undefined => {
  const { record: workflow } = useFindOneRecord<Workflow>({
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
        workflowId: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    skip: !isDefined(workflowId),
  });

  const draftVersion = workflow?.versions.find(
    (workflowVersion) => workflowVersion.status === 'DRAFT',
  );

  const workflowVersions = [...(workflow?.versions ?? [])];

  workflowVersions.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  const latestVersion = workflowVersions[0];

  const currentVersionWithoutSteps = draftVersion ?? latestVersion;

  const { record: currentVersionWithSteps } = useFindOneRecord<WorkflowVersion>(
    {
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      objectRecordId: currentVersionWithoutSteps?.id,
      skip: !isDefined(currentVersionWithoutSteps?.id),
    },
  );

  const currentVersion = currentVersionWithSteps ?? currentVersionWithoutSteps;

  if (!isDefined(workflow) || !isDefined(currentVersion)) {
    return undefined;
  }

  return {
    ...workflow,
    currentVersion,
  };
};
