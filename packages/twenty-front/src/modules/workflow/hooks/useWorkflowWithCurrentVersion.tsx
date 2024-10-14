import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import {
  Workflow,
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { useMemo } from 'react';
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
      versions: {
        totalCount: true,
      },
    },
    skip: !isDefined(workflowId),
  });

  const {
    records: mostRecentWorkflowVersions,
    loading: loadingMostRecentWorkflowVersions,
  } = useFindManyRecords<WorkflowVersion>({
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
    skip: !isDefined(workflowId),
  });

  const workflowWithCurrentVersion = useMemo(() => {
    if (!isDefined(workflow) || loadingMostRecentWorkflowVersions) {
      return undefined;
    }

    const draftVersion = mostRecentWorkflowVersions.find(
      (workflowVersion) => workflowVersion.status === 'DRAFT',
    );
    const latestVersion = mostRecentWorkflowVersions[0];

    const currentVersion = draftVersion ?? latestVersion;

    if (!isDefined(currentVersion)) {
      return undefined;
    }

    return {
      ...workflow,
      currentVersion,
    };
  }, [loadingMostRecentWorkflowVersions, mostRecentWorkflowVersions, workflow]);

  return workflowWithCurrentVersion;
};
