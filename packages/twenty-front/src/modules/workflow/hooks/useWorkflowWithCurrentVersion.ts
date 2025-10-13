import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import {
  type Workflow,
  type WorkflowVersion,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
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

  if (!isDefined(workflow) || !isDefined(currentVersionWithSteps)) {
    return undefined;
  }

  return {
    ...workflow,
    currentVersion: currentVersionWithSteps,
  };
};
