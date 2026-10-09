import { isDefined } from 'twenty-shared/utils';

import { buildCoreDispatchIds } from 'src/engine/core-modules/workflow/utils/build-core-dispatch-ids.util';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { computeCronPatternFromSchedule } from 'src/modules/workflow/workflow-trigger/utils/compute-cron-pattern-from-schedule';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';

export const buildApplicationWorkflowCronTriggerCacheEntries = ({
  workspaceId,
  workflows,
}: {
  workspaceId: string;
  workflows: (UniversalFlatWorkflow & { id: string })[];
}): CachedCronTrigger[] =>
  workflows.flatMap((workflow) => {
    const version = workflow.flatUniversalWorkflowVersion;
    const trigger = version?.triggers?.[0];

    if (!isDefined(version) || trigger?.type !== WorkflowTriggerType.CRON) {
      return [];
    }

    return [
      {
        workspaceId,
        workflowId: workflow.id,
        pattern: computeCronPatternFromSchedule(trigger),
        ...buildCoreDispatchIds({ coreWorkflowVersionId: version.id }),
      },
    ];
  });
