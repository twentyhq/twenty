import { type WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type CachedWorkflowAutomatedTrigger } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type DatabaseEventTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { computeCronPatternFromSchedule } from 'src/modules/workflow/workflow-trigger/utils/compute-cron-pattern-from-schedule';

export const computeAutomatedTriggerFromWorkflowVersion = (
  workflowVersion: WorkflowVersionEntity,
): CachedWorkflowAutomatedTrigger | null => {
  const trigger = workflowVersion.trigger;

  if (trigger === null) {
    return null;
  }

  switch (trigger.type) {
    case WorkflowTriggerType.DATABASE_EVENT:
      return {
        workflowId: workflowVersion.workflowId,
        workflowVersionId: workflowVersion.id,
        type: AutomatedTriggerType.DATABASE_EVENT,
        settings: trigger.settings as DatabaseEventTriggerSettings,
      };
    case WorkflowTriggerType.CRON:
      return {
        workflowId: workflowVersion.workflowId,
        workflowVersionId: workflowVersion.id,
        type: AutomatedTriggerType.CRON,
        settings: { pattern: computeCronPatternFromSchedule(trigger) },
      };
    case WorkflowTriggerType.MANUAL:
    case WorkflowTriggerType.WEBHOOK:
      return null;
    default:
      return null;
  }
};
