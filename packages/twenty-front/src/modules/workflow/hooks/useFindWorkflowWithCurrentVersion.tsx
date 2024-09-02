import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import {
  Workflow,
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-ui';

export const useFindWorkflowWithCurrentVersion = (
  workflowId: string | undefined,
): WorkflowWithCurrentVersion | undefined => {
  const { record: workflow } = useFindOneRecord<Workflow>({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    objectRecordId: workflowId,
    recordGqlFields: {
      id: true,
      name: true,
      lastPublishedVersionId: true,
      statuses: true,
      versions: true,
    },
    skip: !isDefined(workflowId),
  });

  const { record: lastPublishedVersion } = useFindOneRecord<WorkflowVersion>({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    objectRecordId: workflow?.lastPublishedVersionId,
    skip: !(
      typeof workflow?.lastPublishedVersionId === 'string' &&
      workflow.lastPublishedVersionId !== ''
    ),
    recordGqlFields: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      workflowId: true,
      trigger: true,
      steps: true,
    },
  });

  const { records: workflowDraftVersions } =
    useFindManyRecords<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      filter: {
        status: {
          eq: 'DRAFT',
        },
      },
      limit: 1,
    });

  if (!isDefined(workflow)) {
    return undefined;
  }

  const draftVersion = workflowDraftVersions?.[0];
  const currentVersion = draftVersion || lastPublishedVersion;

  return {
    ...workflow,
    currentVersion,
  };
};
