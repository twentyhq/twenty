import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import {
  Workflow,
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-ui';

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
    },
    skip: !isDefined(workflowId),
  });

  const { records: mostRecentWorkflowVersions } =
    useFindManyRecords<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      filter: {
        workflowId: {
          eq: workflowId,
        },
      },
      orderBy: [
        {
          createdAt: 'DescNullsLast',
        },
      ],
      limit: 1,
      skip: !isDefined(workflowId),
    });

  if (!isDefined(workflow)) {
    return undefined;
  }

  const currentVersion = mostRecentWorkflowVersions?.[0];
  if (!isDefined(currentVersion)) {
    return undefined;
  }

  return {
    ...workflow,
    currentVersion,
  };
};
