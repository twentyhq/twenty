import { t } from '@lingui/core/macro';
import { differenceInCalendarDays, differenceInCalendarWeeks } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { CalendarStartDay } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadDateGroup } from '@/ai/types/AgentChatThreadDateGroup';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { sortAgentChatThreadsBySnoozedUntil } from '@/ai/utils/sortAgentChatThreadsBySnoozedUntil';

const getSnoozeDateGroup = ({
  snoozedUntil,
  today,
  timeZone,
  calendarStartDay,
}: {
  snoozedUntil: string;
  today: Date;
  timeZone: string;
  calendarStartDay: CalendarStartDay;
}): Omit<AgentChatThreadDateGroup, 'threads'> => {
  const wakeDate = toZonedTime(snoozedUntil, timeZone);
  const todayInTimeZone = toZonedTime(today, timeZone);
  const daysUntilWake = differenceInCalendarDays(wakeDate, todayInTimeZone);

  if (daysUntilWake <= 0) {
    return { id: 'later-today', title: t`Later today` };
  }

  if (daysUntilWake === 1) {
    return { id: 'tomorrow', title: t`Tomorrow` };
  }

  const weeksUntilWake = differenceInCalendarWeeks(wakeDate, todayInTimeZone, {
    weekStartsOn:
      calendarStartDay === CalendarStartDay.SYSTEM
        ? CalendarStartDay.MONDAY
        : calendarStartDay,
  });

  if (weeksUntilWake === 0) {
    return { id: 'this-week', title: t`This week` };
  }

  if (weeksUntilWake === 1) {
    return { id: 'next-week', title: t`Next week` };
  }

  return {
    id: `month:${wakeDate.getFullYear()}-${wakeDate.getMonth() + 1}`,
    title: new Intl.DateTimeFormat(undefined, {
      timeZone,
      month: 'long',
      year: 'numeric',
    }).format(new Date(snoozedUntil)),
  };
};

export const groupThreadsBySnoozeTime = ({
  threads,
  snoozedUntilByThreadId,
  timeZone,
  calendarStartDay = CalendarStartDay.MONDAY,
  today = new Date(),
}: {
  threads: AgentChatThreadRecord[];
  snoozedUntilByThreadId: Record<string, string>;
  timeZone: string;
  calendarStartDay?: CalendarStartDay;
  today?: Date;
}): AgentChatThreadDateGroup[] => {
  const groups = new Map<string, AgentChatThreadDateGroup>();
  const snoozedThreads = sortAgentChatThreadsBySnoozedUntil({
    threads,
    snoozedUntilByThreadId,
  });

  for (const thread of snoozedThreads) {
    const group = getSnoozeDateGroup({
      snoozedUntil: snoozedUntilByThreadId[thread.id],
      today,
      timeZone,
      calendarStartDay,
    });
    const existingGroup = groups.get(group.id);

    if (isDefined(existingGroup)) {
      existingGroup.threads.push(thread);

      continue;
    }

    groups.set(group.id, { ...group, threads: [thread] });
  }

  return [...groups.values()];
};
