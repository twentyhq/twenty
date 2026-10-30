import { describe, expect, it } from 'vitest';

import { CALENDAR_BOT_SCHEDULING_APPLY_SETTLE_DELAY_MS } from 'src/logic-functions/constants/calendar-bot-scheduling-apply-settle-delay-ms';
import { CALENDAR_BOT_SCHEDULING_APPLY_WINDOW_MS } from 'src/logic-functions/constants/calendar-bot-scheduling-apply-window-ms';
import { buildCalendarBotSchedulingApplyJob } from 'src/logic-functions/domain/build-calendar-bot-scheduling-apply-job.util';

const WINDOW_START = new Date('2026-10-30T12:00:00.000Z').getTime();
const WINDOW_END = WINDOW_START + CALENDAR_BOT_SCHEDULING_APPLY_WINDOW_MS;

const buildApplyJobRunningAt = (now: number) => {
  const { jobId, delayMs } = buildCalendarBotSchedulingApplyJob({ now });

  return { jobId, runsAt: now + delayMs };
};

describe('buildCalendarBotSchedulingApplyJob', () => {
  it('gives every toggle within one window the same job', () => {
    expect(buildApplyJobRunningAt(WINDOW_END - 1)).toEqual(
      buildApplyJobRunningAt(WINDOW_START),
    );
  });

  it('gives a toggle in the next window a new job, one window later', () => {
    const toggle = buildApplyJobRunningAt(WINDOW_END - 1);
    const nextWindowToggle = buildApplyJobRunningAt(WINDOW_END);

    expect(nextWindowToggle.jobId).not.toBe(toggle.jobId);
    expect(nextWindowToggle.runsAt - toggle.runsAt).toBe(
      CALENDAR_BOT_SCHEDULING_APPLY_WINDOW_MS,
    );
  });

  it('runs the job just after its window closes', () => {
    const { runsAt } = buildApplyJobRunningAt(WINDOW_START + 5_000);

    expect(runsAt).toBe(
      WINDOW_END + CALENDAR_BOT_SCHEDULING_APPLY_SETTLE_DELAY_MS,
    );
  });

  it('applies a toggle made at the start of a window within 30 seconds', () => {
    const { delayMs } = buildCalendarBotSchedulingApplyJob({
      now: WINDOW_START,
    });

    expect(delayMs).toBeLessThanOrEqual(30_000);
  });
});
