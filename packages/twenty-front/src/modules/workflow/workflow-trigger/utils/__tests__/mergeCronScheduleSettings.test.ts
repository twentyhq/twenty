import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { mergeCronScheduleSettings } from '@/workflow/workflow-trigger/utils/mergeCronScheduleSettings';

it('preserves existing output and unknown settings and schedule properties', () => {
  const settings: WorkflowCronTrigger['settings'] = {
    type: 'DAYS',
    schedule: { day: 1, hour: 9, minute: 0 },
    outputSchema: { saved: true },
  };
  const extendedSettings = {
    ...settings,
    timezone: 'UTC',
    schedule: { ...settings.schedule, customScheduleOption: 'retained' },
  };
  const updated = mergeCronScheduleSettings({
    settings: extendedSettings,
    nextSettings: {
      type: 'DAYS',
      schedule: { day: 2, hour: 10, minute: 30 },
      outputSchema: {},
    },
  });
  expect(updated).toMatchObject({
    timezone: 'UTC',
    schedule: {
      day: 2,
      hour: 10,
      minute: 30,
      customScheduleOption: 'retained',
    },
    outputSchema: { saved: true },
  });
});
