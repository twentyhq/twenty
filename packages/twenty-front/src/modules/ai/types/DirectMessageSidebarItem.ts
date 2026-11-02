import { type DirectMessageMember } from '@/ai/types/DirectMessageMember';

export type DirectMessageSidebarItem = {
  threadId: string;
  peer: DirectMessageMember;
  isUnread: boolean;
};
