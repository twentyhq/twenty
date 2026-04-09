import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';

export const convertScheduleToCronExpression = (
  trigger: WorkflowCronTrigger,
): string | null => {
  switch (trigger.settings.type) {
    case 'CUSTOM':
      return trigger.settings.pattern;
    case 'DAYS':
      return `${trigger.settings.schedule.minute} ${trigger.settings.schedule.hour} */${trigger.settings.schedule.day} * *`;
    case 'HOURS':
      return `${trigger.settings.schedule.minute} */${trigger.settings.schedule.hour} * * *`;
    case 'MINUTES':
      return `*/${trigger.settings.schedule.minute} * * * *`;
    default:
      return null;
  }
};
