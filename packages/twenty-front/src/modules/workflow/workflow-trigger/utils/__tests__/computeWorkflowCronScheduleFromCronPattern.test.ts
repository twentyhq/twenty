import { computeCronPatternFromWorkflowCronSchedule } from '@/workflow/workflow-trigger/utils/computeCronPatternFromWorkflowCronSchedule';
import { computeWorkflowCronScheduleFromCronPattern } from '@/workflow/workflow-trigger/utils/computeWorkflowCronScheduleFromCronPattern';

describe('computeWorkflowCronScheduleFromCronPattern', () => {
  it.each([
    [
      '30 9 */2 * *',
      { type: 'DAYS', schedule: { minute: 30, hour: 9, day: 2 } },
    ],
    ['0 0 */1 * *', { type: 'DAYS', schedule: { minute: 0, hour: 0, day: 1 } }],
    ['15 */3 * * *', { type: 'HOURS', schedule: { minute: 15, hour: 3 } }],
    ['*/10 * * * *', { type: 'MINUTES', schedule: { minute: 10 } }],
  ])('opens %s in the schedule editor mode', (pattern, expectedSchedule) => {
    expect(computeWorkflowCronScheduleFromCronPattern(pattern)).toEqual(
      expectedSchedule,
    );
  });

  it.each([
    '0 9 * * 1',
    '*/5 * * * * *',
    '05 9 */2 * *',
    '0 24 */1 * *',
    '*/0 * * * *',
    '*/61 * * * *',
    '0 */0 * * *',
  ])('keeps %s as a custom pattern', (pattern) => {
    expect(computeWorkflowCronScheduleFromCronPattern(pattern)).toEqual({
      type: 'CUSTOM',
      pattern,
    });
  });

  it.each([
    '30 9 */2 * *',
    '15 */3 * * *',
    '*/60 * * * *',
    '0 9 * * 1',
    '05 9 */2 * *',
  ])('computes %s back from its schedule', (pattern) => {
    expect(
      computeCronPatternFromWorkflowCronSchedule(
        computeWorkflowCronScheduleFromCronPattern(pattern),
      ),
    ).toBe(pattern);
  });
});
