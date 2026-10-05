import { type CachedWorkflowAutomatedTrigger } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import {
  type BaseDatabaseEventTriggerSettings,
  type CronTriggerSettings,
} from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

export const isCachedCronTrigger = (
  trigger: CachedWorkflowAutomatedTrigger,
): trigger is CachedWorkflowAutomatedTrigger & {
  settings: CronTriggerSettings;
} => trigger.type === AutomatedTriggerType.CRON;

export const isCachedDatabaseEventTrigger = (
  trigger: CachedWorkflowAutomatedTrigger,
): trigger is CachedWorkflowAutomatedTrigger & {
  settings: BaseDatabaseEventTriggerSettings;
} => trigger.type === AutomatedTriggerType.DATABASE_EVENT;
