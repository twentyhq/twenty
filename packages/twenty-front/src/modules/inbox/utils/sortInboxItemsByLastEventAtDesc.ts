import { type InboxItem } from '~/generated/graphql';

export const sortInboxItemsByLastEventAtDesc = (inboxItems: InboxItem[]) =>
  [...inboxItems].sort(
    (firstInboxItem, secondInboxItem) =>
      new Date(secondInboxItem.lastEventAt).getTime() -
      new Date(firstInboxItem.lastEventAt).getTime(),
  );
