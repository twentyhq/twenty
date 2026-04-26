import { t } from '@lingui/core/macro';
import { differenceInCalendarDays } from 'date-fns';

import { type AgentChatThread } from '~/generated-metadata/graphql';

export type AgentChatThreadDateGroup = {
  id: string;
  title: string;
  threads: AgentChatThread[];
};

const getLocalDayDifference = (date: Date, today: Date) =>
  differenceInCalendarDays(today, date);

const getLocalDateGroupId = (date: Date) =>
  `date:${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const getMonthGroupId = (date: Date) =>
  `month:${date.getFullYear()}-${date.getMonth() + 1}`;

const formatDateGroupTitle = (date: Date, today: Date) =>
  new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() === today.getFullYear() ? {} : { year: 'numeric' }),
  }).format(date);

const formatMonthGroupTitle = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(date);

const getThreadDateGroup = (
  threadUpdatedAt: Date,
  today: Date,
): Omit<AgentChatThreadDateGroup, 'threads'> => {
  const localDayDifference = getLocalDayDifference(threadUpdatedAt, today);

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
      id: getLocalDateGroupId(threadUpdatedAt),
      title: formatDateGroupTitle(threadUpdatedAt, today),
    };
  }

  return {
    id: getMonthGroupId(threadUpdatedAt),
    title: formatMonthGroupTitle(threadUpdatedAt),
  };
};

export const groupThreadsByDate = (
  threads: AgentChatThread[],
  today = new Date(),
): AgentChatThreadDateGroup[] => {
  const groupedThreadsByDate = new Map<string, AgentChatThreadDateGroup>();

  for (const thread of threads) {
    // TODO: use a dedicated conversation activity timestamp once available;
    // updatedAt also changes for archive/unarchive metadata updates.
    const threadDateGroup = getThreadDateGroup(
      new Date(thread.updatedAt),
      today,
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
