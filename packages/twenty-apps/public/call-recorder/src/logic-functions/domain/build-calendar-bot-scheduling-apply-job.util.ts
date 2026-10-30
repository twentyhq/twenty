import { CALENDAR_BOT_SCHEDULING_APPLY_SETTLE_DELAY_MS } from 'src/logic-functions/constants/calendar-bot-scheduling-apply-settle-delay-ms';
import { CALENDAR_BOT_SCHEDULING_APPLY_WINDOW_MS } from 'src/logic-functions/constants/calendar-bot-scheduling-apply-window-ms';

export const buildCalendarBotSchedulingApplyJob = ({
  now,
}: {
  now: number;
}): { jobId: string; delayMs: number } => {
  const applyWindowIndex = Math.floor(
    now / CALENDAR_BOT_SCHEDULING_APPLY_WINDOW_MS,
  );
  const applyWindowEnd =
    (applyWindowIndex + 1) * CALENDAR_BOT_SCHEDULING_APPLY_WINDOW_MS;

  return {
    jobId: `call-recorder-calendar-bot-scheduling-apply-${applyWindowIndex}`,
    delayMs:
      applyWindowEnd - now + CALENDAR_BOT_SCHEDULING_APPLY_SETTLE_DELAY_MS,
  };
};
