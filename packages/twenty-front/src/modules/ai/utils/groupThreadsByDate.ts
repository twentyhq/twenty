import { t } from '@lingui/core/macro';
import { differenceInCalendarDays, startOfWeek } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadDateGroup } from '@/ai/types/AgentChatThreadDateGroup';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type AiChatThreadListVariant } from '@/ai/types/AiChatThreadListVariant';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';

const RECENT_THREAD_DAY_COUNT = 7;
const COMPACT_WEEK_START_DAY = 1;
const COMPACT_DATE_GROUP_IDS = ['today', 'this-week', 'earlier'];

const getMonthGroupId = (date: Date) =>
  `month:${date.getFullYear()}-${date.getMonth() + 1}`;

const formatMonthGroupTitle = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(date);

const getCompactPastThreadDateGroup = ({
  daysSinceActivity,
  today,
}: {
  daysSinceActivity: number;
  today: Date;
}): Omit<AgentChatThreadDateGroup, 'threads'> => {
  const daysSinceWeekStart = differenceInCalendarDays(
    today,
    startOfWeek(today, { weekStartsOn: COMPACT_WEEK_START_DAY }),
  );

  if (daysSinceActivity <= daysSinceWeekStart) {
    return {
      id: 'this-week',
      title: t`This week`,
    };
  }

  return {
    id: 'earlier',
    title: t`Earlier`,
  };
};

const getThreadDateGroup = ({
  threadActivityAt,
  today,
  variant,
}: {
  threadActivityAt: Date;
  today: Date;
  variant: AiChatThreadListVariant;
}): Omit<AgentChatThreadDateGroup, 'threads'> => {
  const daysSinceActivity = differenceInCalendarDays(today, threadActivityAt);
  const isToday = daysSinceActivity === 0;
  const isUpcomingCompactThread =
    variant === 'compact' && daysSinceActivity < 0;

  if (isToday || isUpcomingCompactThread) {
    return {
      id: 'today',
      title: t`Today`,
    };
  }

  if (variant === 'compact') {
    return getCompactPastThreadDateGroup({ daysSinceActivity, today });
  }

  if (daysSinceActivity === 1) {
    return {
      id: 'yesterday',
      title: t`Yesterday`,
    };
  }

  if (daysSinceActivity >= 2 && daysSinceActivity <= RECENT_THREAD_DAY_COUNT) {
    return {
      id: 'previous-7-days',
      title: t`Previous 7 days`,
    };
  }

  return {
    id: getMonthGroupId(threadActivityAt),
    title: formatMonthGroupTitle(threadActivityAt),
  };
};

export const groupThreadsByDate = ({
  threads,
  today = new Date(),
  variant = 'default',
}: {
  threads: AgentChatThreadRecord[];
  today?: Date;
  variant?: AiChatThreadListVariant;
}): AgentChatThreadDateGroup[] => {
  const groupedThreadsByDate = new Map<string, AgentChatThreadDateGroup>();

  for (const thread of threads) {
    const threadDateGroup = getThreadDateGroup({
      threadActivityAt: new Date(getAgentChatThreadLastActivityAt(thread)),
      today,
      variant,
    });
    const existingThreadDateGroup = groupedThreadsByDate.get(
      threadDateGroup.id,
    );

    if (isDefined(existingThreadDateGroup)) {
      existingThreadDateGroup.threads.push(thread);

      continue;
    }

    groupedThreadsByDate.set(threadDateGroup.id, {
      ...threadDateGroup,
      threads: [thread],
    });
  }

  if (variant === 'compact') {
    return COMPACT_DATE_GROUP_IDS.map((groupId) =>
      groupedThreadsByDate.get(groupId),
    ).filter(isDefined);
  }

  return [...groupedThreadsByDate.values()];
};
