import { type AgentChatThreadSnoozePresetKey } from '@/ai/types/AgentChatThreadSnoozePreset';

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const NEXT_MORNING_HOUR = 9;
const MONDAY_DAY_OF_WEEK = 1;
const DAYS_PER_WEEK = 7;

const atHour = (date: Date, hour: number): Date => {
  const result = new Date(date);

  result.setHours(hour, 0, 0, 0);

  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
};

export const getAgentChatThreadSnoozeDate = (
  presetKey: AgentChatThreadSnoozePresetKey,
  now: Date = new Date(),
): Date => {
  switch (presetKey) {
    case 'oneHour':
      return new Date(now.getTime() + MILLISECONDS_PER_HOUR);
    case 'threeHours':
      return new Date(now.getTime() + 3 * MILLISECONDS_PER_HOUR);
    case 'tomorrow':
      return atHour(addDays(now, 1), NEXT_MORNING_HOUR);
    case 'nextWeek': {
      // Counting to the coming Monday rather than adding seven days, so a
      // thread put off on Friday and one put off on Monday both come back at
      // the start of the same week.
      const daysUntilMonday =
        (MONDAY_DAY_OF_WEEK - now.getDay() + DAYS_PER_WEEK) % DAYS_PER_WEEK ||
        DAYS_PER_WEEK;

      return atHour(addDays(now, daysUntilMonday), NEXT_MORNING_HOUR);
    }
  }
};
