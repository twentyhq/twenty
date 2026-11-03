import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { type CronScheduleDraft } from '@/workflow/workflow-trigger/types/CronScheduleDraft';

export const getCronScheduleDraftFromSettings = (
  settings: WorkflowCronTrigger['settings'],
): CronScheduleDraft => ({
  interval: settings.type,
  pattern: settings.type === 'CUSTOM' ? settings.pattern : '',
  day: settings.type === 'DAYS' ? String(settings.schedule.day) : '1',
  hour:
    settings.type === 'DAYS' || settings.type === 'HOURS'
      ? String(settings.schedule.hour)
      : '0',
  minute: settings.type === 'CUSTOM' ? '0' : String(settings.schedule.minute),
});
