import { type InboxDirectMessageMember } from '@/inbox/types/InboxDirectMessageMember';

export type InboxDirectMessageSidebarItem = {
  threadId: string;
  peer: InboxDirectMessageMember | null;
  isUnread: boolean;
};
