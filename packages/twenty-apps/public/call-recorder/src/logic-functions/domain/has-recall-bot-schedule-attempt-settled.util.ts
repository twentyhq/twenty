const RECALL_BOT_SCHEDULE_ATTEMPT_SETTLING_WINDOW_MS = 2 * 60 * 1000;

export const hasRecallBotScheduleAttemptSettled = (
  botScheduleAttemptedAt: string,
): boolean => {
  const attemptedAt = new Date(botScheduleAttemptedAt).getTime();

  return (
    Number.isNaN(attemptedAt) ||
    Date.now() - attemptedAt >= RECALL_BOT_SCHEDULE_ATTEMPT_SETTLING_WINDOW_MS
  );
};
