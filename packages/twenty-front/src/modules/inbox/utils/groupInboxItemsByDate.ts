import { t } from '@lingui/core/macro';
import { differenceInCalendarDays } from 'date-fns';

import { type InboxItemDateGroup } from '@/inbox/types/InboxItemDateGroup';
import { type InboxItem } from '~/generated/graphql';

const getMonthGroupId = (date: Date) =>
  `month:${date.getFullYear()}-${date.getMonth() + 1}`;

const formatMonthGroupTitle = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(date);

const getInboxItemDateGroup = (
  inboxItemActivityAt: Date,
  today: Date,
): Omit<InboxItemDateGroup, 'inboxItems'> => {
  const localDayDifference = differenceInCalendarDays(
    today,
    inboxItemActivityAt,
  );

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
    id: getMonthGroupId(inboxItemActivityAt),
    title: formatMonthGroupTitle(inboxItemActivityAt),
  };
};

export const groupInboxItemsByDate = (
  inboxItems: InboxItem[],
  today = new Date(),
): InboxItemDateGroup[] => {
  const groupedInboxItemsByDate = new Map<string, InboxItemDateGroup>();

  for (const inboxItem of inboxItems) {
    const inboxItemDateGroup = getInboxItemDateGroup(
      new Date(inboxItem.updatedAt),
      today,
    );
    const existingInboxItemDateGroup = groupedInboxItemsByDate.get(
      inboxItemDateGroup.id,
    );

    if (existingInboxItemDateGroup !== undefined) {
      existingInboxItemDateGroup.inboxItems.push(inboxItem);
    } else {
      groupedInboxItemsByDate.set(inboxItemDateGroup.id, {
        ...inboxItemDateGroup,
        inboxItems: [inboxItem],
      });
    }
  }

  return [...groupedInboxItemsByDate.values()];
};
