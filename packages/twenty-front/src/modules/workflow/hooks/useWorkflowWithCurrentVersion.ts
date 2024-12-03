import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import {
  Workflow,
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
      lastPublishedVersionId: true,
      versions: true,
    },
    skip: !isDefined(workflowId),
  });

  return useMemo(() => {
    if (!isDefined(workflow)) {
      return undefined;
    }

    const draftVersion = workflow.versions.find(
      (workflowVersion) => workflowVersion.status === 'DRAFT',
    );

    const workflowVersions = [...workflow.versions];

    workflowVersions.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

    const latestVersion = workflowVersions[0];

    const currentVersion = draftVersion ?? latestVersion;

    if (!isDefined(currentVersion)) {
      return undefined;
    }

    return {
      ...workflow,
      currentVersion,
    };
  }, [workflow]);
};
