import { getCronTriggerDefaultSchedule } from '@/workflow/workflow-trigger/utils/getCronTriggerDefaultSchedule';

describe('getCronTriggerDefaultSchedule', () => {
  it.each([
    ['DAYS', { type: 'DAYS', schedule: { day: 1, hour: 0, minute: 0 } }],
    ['HOURS', { type: 'HOURS', schedule: { hour: 1, minute: 0 } }],
    ['MINUTES', { type: 'MINUTES', schedule: { minute: 1 } }],
    ['CUSTOM', { type: 'CUSTOM', pattern: '0 */1 * * *' }],
  ] as const)('returns the default %s schedule', (interval, expected) => {
    expect(getCronTriggerDefaultSchedule(interval)).toEqual(expected);
  });
});
