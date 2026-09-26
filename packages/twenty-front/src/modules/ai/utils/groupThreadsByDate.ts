import { t } from '@lingui/core/macro';
import { differenceInCalendarDays } from 'date-fns';
import { turnJSDateToPlainDate } from 'twenty-shared/utils';

import { type CalendarSystem } from '@/localization/constants/CalendarSystem';

import { type AgentChatThread } from '~/generated-metadata/graphql';

export type AgentChatThreadDateGroup = {
  id: string;
  title: string;
  threads: AgentChatThread[];
};

const getLocalDayDifference = (date: Date, today: Date) =>
  differenceInCalendarDays(today, date);

const getMonthGroupId = (date: Date, calendarSystem: CalendarSystem) => {
  const { year, month } =
    turnJSDateToPlainDate(date).withCalendar(calendarSystem);

  return `month:${year}-${month}`;
};

const formatMonthGroupTitle = (date: Date, calendarSystem: CalendarSystem) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
    calendar: calendarSystem,
  }).format(date);

const getThreadDateGroup = (
  threadActivityAt: Date,
  today: Date,
  calendarSystem: CalendarSystem,
): Omit<AgentChatThreadDateGroup, 'threads'> => {
  const localDayDifference = getLocalDayDifference(threadActivityAt, today);

  if (localDayDifference === 0) {
    return {
      id: 'today',
      title: t`Today`,
    };
  }

  if (localDayDifference === 1) {
    return {
      id: 'yesterday',
      title: t`Yesterday`,
    };
  }

  if (localDayDifference >= 2 && localDayDifference <= 7) {
    return {
      id: 'previous-7-days',
      title: t`Previous 7 days`,
    };
  }

  return {
    id: getMonthGroupId(threadActivityAt, calendarSystem),
    title: formatMonthGroupTitle(threadActivityAt, calendarSystem),
  };
};

export const groupThreadsByDate = (
  threads: AgentChatThread[],
  calendarSystem: CalendarSystem,
  today = new Date(),
): AgentChatThreadDateGroup[] => {
  const groupedThreadsByDate = new Map<string, AgentChatThreadDateGroup>();

  for (const thread of threads) {
    const threadDateGroup = getThreadDateGroup(
      new Date(thread.lastMessageAt ?? thread.updatedAt),
      today,
      calendarSystem,
    );
    const existingThreadDateGroup = groupedThreadsByDate.get(
      threadDateGroup.id,
    );

    if (existingThreadDateGroup !== undefined) {
      existingThreadDateGroup.threads.push(thread);
    } else {
      groupedThreadsByDate.set(threadDateGroup.id, {
        ...threadDateGroup,
        threads: [thread],
      });
    }
  }

  return [...groupedThreadsByDate.values()];
};
