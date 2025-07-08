import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerLabel';
import { DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';
import { OTHER_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/OtherTriggerTypes';
import { getTriggerStepName } from '@/workflow/workflow-variables/utils/getTriggerStepName';

const labels = [
  ...Object.values(DatabaseTriggerDefaultLabel),

  ...OTHER_TRIGGER_TYPES.map((t) => t.defaultLabel),

  getTriggerStepName({ type: 'CRON', settings: { /* schedule dummy */ type: 'DAYS', schedule: { day: 1, hour: 0, minute: 0 }, outputSchema: {} } }),
  getTriggerStepName({ type: 'MANUAL', settings: { objectType: 'company', outputSchema: {}, icon: 'IconHandMove' } }),
  getTriggerStepName({ type: 'WEBHOOK', settings: { httpMethod: 'GET', authentication: null, outputSchema: {} } }),

  getTriggerDefaultLabel({ type: 'CRON', name: '', settings: { type: 'DAYS', schedule: { day: 1, hour: 0, minute: 0 }, outputSchema: {} } }),
  getTriggerDefaultLabel({ type: 'MANUAL', name: '', settings: { objectType: 'company', outputSchema: {}, icon: 'IconHandMove' } }),
  getTriggerDefaultLabel({ type: 'WEBHOOK', name: '', settings: { httpMethod: 'GET', authentication: null, outputSchema: {} } }),

];

describe('All UI labels use sentence case', () => {
  it.each(labels)('"%s" should only have the first letter uppercase', (label) => {
    expect(label).toMatch(/^[A-Z][^A-Z]*$/);
  });
});