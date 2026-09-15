import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getCurrentWorkflowVersionId } from '@/command-menu-item/utils/getCurrentWorkflowVersionId';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import {
  type Workflow,
  type WorkflowVersion,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';

export const useWorkflowsWithCurrentVersions = (
  workflowIds: string[],
): WorkflowWithCurrentVersion[] => {
  const { records: workflows } = useFindManyRecords<Workflow>({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    filter: { id: { in: workflowIds } },
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
    skip: workflowIds.length === 0,
  });

  const currentVersionIds = workflows
    .map(getCurrentWorkflowVersionId)
    .filter(isDefined);

  const { records: currentVersions } = useFindManyRecords<WorkflowVersion>({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    filter: { id: { in: currentVersionIds } },
    skip: currentVersionIds.length === 0,
  });

  return workflows
    .map((workflow) => {
      const currentVersionId = getCurrentWorkflowVersionId(workflow);
      const currentVersion = currentVersions.find(
        (version) => version.id === currentVersionId,
      );

      if (!isDefined(currentVersion)) {
        return undefined;
      }

      return {
        ...workflow,
        currentVersion,
      };
    })
    .filter(isDefined);
};
