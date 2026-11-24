import { isDefined } from 'twenty-shared/utils';

import { type WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { computeCronPatternFromSchedule } from 'src/modules/workflow/workflow-trigger/utils/compute-cron-pattern-from-schedule';

export const buildCronTriggerCacheEntry = ({
  trigger,
  coreWorkflow,
  coreWorkflowVersion,
}: {
  trigger: WorkflowTrigger | null;
  coreWorkflow: Pick<WorkflowEntity, 'id' | 'workspaceWorkflowId'>;
  coreWorkflowVersion: Pick<WorkflowVersionEntity, 'id' | 'workspaceId'>;
}): CachedCronTrigger | null => {
  if (!isDefined(trigger) || trigger.type !== WorkflowTriggerType.CRON) {
    return null;
  }

  return {
    workspaceId: coreWorkflowVersion.workspaceId,
    workflowId: coreWorkflow.id,
    ...(isDefined(coreWorkflow.workspaceWorkflowId)
      ? { legacyWorkflowId: coreWorkflow.workspaceWorkflowId }
      : {}),
    pattern: computeCronPatternFromSchedule(trigger),
    coreWorkflowVersionId: coreWorkflowVersion.id,
  };
};
