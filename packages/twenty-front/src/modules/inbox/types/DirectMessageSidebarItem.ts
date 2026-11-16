import { type DirectMessageMember } from '@/inbox/types/DirectMessageMember';

export type DirectMessageSidebarItem = {
  threadId: string;
  peer: DirectMessageMember | null;
  isUnread: boolean;
};
