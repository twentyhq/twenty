import { type InboxItem } from '~/generated/graphql';

export const sortInboxItemsByUpdatedAtDesc = (inboxItems: InboxItem[]) =>
  [...inboxItems].sort(
    (firstInboxItem, secondInboxItem) =>
      new Date(secondInboxItem.updatedAt).getTime() -
      new Date(firstInboxItem.updatedAt).getTime(),
  );
