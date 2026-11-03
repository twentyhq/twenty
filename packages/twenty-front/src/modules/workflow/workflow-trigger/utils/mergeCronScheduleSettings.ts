import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';

export const mergeCronScheduleSettings = ({
  settings,
  nextSettings,
}: {
  settings: WorkflowCronTrigger['settings'];
  nextSettings: WorkflowCronTrigger['settings'];
}): WorkflowCronTrigger['settings'] => {
  const previousSchedule = 'schedule' in settings ? settings.schedule : {};
  switch (nextSettings.type) {
    case 'CUSTOM':
      return {
        ...settings,
        ...nextSettings,
        outputSchema: settings.outputSchema,
      };
    case 'DAYS':
      return {
        ...settings,
        ...nextSettings,
        schedule: { ...previousSchedule, ...nextSettings.schedule },
        outputSchema: settings.outputSchema,
      };
    case 'HOURS':
      return {
        ...settings,
        ...nextSettings,
        schedule: { ...previousSchedule, ...nextSettings.schedule },
        outputSchema: settings.outputSchema,
      };
    case 'MINUTES':
      return {
        ...settings,
        ...nextSettings,
        schedule: { ...previousSchedule, ...nextSettings.schedule },
        outputSchema: settings.outputSchema,
      };
  }
};
