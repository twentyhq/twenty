import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

const NEXT_MORNING_HOUR = 9;
const NEXT_WEEK_MONDAY = 1;

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

export type AgentChatThreadSnoozePreset = {
  key: string;
  label: MessageDescriptor;
  getSnoozedUntil: (now?: Date) => Date;
};

export const AGENT_CHAT_THREAD_SNOOZE_PRESETS: AgentChatThreadSnoozePreset[] = [
  {
    key: 'oneHour',
    label: msg`In an hour`,
    getSnoozedUntil: (now = new Date()) =>
      new Date(now.getTime() + MILLISECONDS_PER_HOUR),
  },
  {
    key: 'threeHours',
    label: msg`In three hours`,
    getSnoozedUntil: (now = new Date()) =>
      new Date(now.getTime() + 3 * MILLISECONDS_PER_HOUR),
  },
  {
    key: 'tomorrow',
    label: msg`Tomorrow morning`,
    getSnoozedUntil: (now = new Date()) =>
      atHour(addDays(now, 1), NEXT_MORNING_HOUR),
  },
  {
    key: 'nextWeek',
    label: msg`Next week`,
    // Counting to the coming Monday rather than adding seven days, so a
    // thread snoozed on Friday and one snoozed on Monday both come back at
    // the start of the same week.
    getSnoozedUntil: (now = new Date()) => {
      const daysUntilMonday = (NEXT_WEEK_MONDAY - now.getDay() + 7) % 7 || 7;

      return atHour(addDays(now, daysUntilMonday), NEXT_MORNING_HOUR);
    },
  },
];
