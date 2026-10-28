import { t } from '@lingui/core/macro';
import { differenceInCalendarDays, startOfWeek } from 'date-fns';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';

export const groupRecordChatThreadsByDate = ({
  threads,
  today = new Date(),
}: {
  threads: AgentChatThreadRecord[];
  today?: Date;
}) => {
  const groups = [
    { id: 'today', title: t`Today`, threads: [] as AgentChatThreadRecord[] },
    {
      id: 'this-week',
      title: t`This week`,
      threads: [] as AgentChatThreadRecord[],
    },
    {
      id: 'earlier',
      title: t`Earlier`,
      threads: [] as AgentChatThreadRecord[],
    },
  ];
  const daysSinceWeekStart = differenceInCalendarDays(
    today,
    startOfWeek(today, { weekStartsOn: 1 }),
  );

  for (const thread of threads) {
    const daysSinceActivity = differenceInCalendarDays(
      today,
      new Date(getAgentChatThreadLastActivityAt(thread)),
    );
    const groupIndex =
      daysSinceActivity <= 0
        ? 0
        : daysSinceActivity <= daysSinceWeekStart
          ? 1
          : 2;

    groups[groupIndex].threads.push(thread);
  }

  return groups.filter(({ threads: groupedThreads }) =>
    isNonEmptyArray(groupedThreads),
  );
};
