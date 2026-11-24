import { type WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { AutomatedTriggerType } from 'src/engine/core-modules/workflow/enums/automated-trigger-type.enum';
import { type CachedWorkflowAutomatedTrigger } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import { type DatabaseEventTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { computeCronPatternFromSchedule } from 'src/modules/workflow/workflow-trigger/utils/compute-cron-pattern-from-schedule';

export const computeAutomatedTriggerFromWorkflowVersion = ({
  workflowVersion,
}: {
  workflowVersion: Pick<
    WorkflowVersionEntity,
    'id' | 'coreWorkflowId' | 'applicationId' | 'triggers'
  >;
}): CachedWorkflowAutomatedTrigger | null => {
  const trigger = workflowVersion.triggers?.[0] ?? null;

  if (trigger === null || workflowVersion.coreWorkflowId === null) {
    return null;
  }

  switch (trigger.type) {
    case WorkflowTriggerType.DATABASE_EVENT:
      return {
        workflowId: workflowVersion.coreWorkflowId,
        applicationId: workflowVersion.applicationId,
        coreWorkflowVersionId: workflowVersion.id,
        type: AutomatedTriggerType.DATABASE_EVENT,
        settings: trigger.settings as DatabaseEventTriggerSettings,
      };
    case WorkflowTriggerType.CRON:
      return {
        workflowId: workflowVersion.coreWorkflowId,
        applicationId: workflowVersion.applicationId,
        coreWorkflowVersionId: workflowVersion.id,
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
