import { type InboxItem } from '~/generated/graphql';

export type InboxItemDateGroup = {
  id: string;
  title: string;
  inboxItems: InboxItem[];
};
