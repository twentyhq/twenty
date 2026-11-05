import { type DirectMessageMember } from '@/ai/types/DirectMessageMember';
import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';

export const DIRECT_MESSAGE_PRESENTATION_FIXTURE = {
  currentMember: {
    workspaceMemberId: 'raphael',
    name: 'Raphael',
    email: 'raphael@example.com',
  },
  directMessages: [
    {
      threadId: 'dm-anna',
      peer: {
        workspaceMemberId: 'anna',
        name: 'Anna',
        email: 'anna@example.com',
      },
      isUnread: false,
    },
    {
      threadId: 'dm-felix',
      peer: {
        workspaceMemberId: 'felix',
        name: 'Felix',
        email: 'felix@example.com',
      },
      isUnread: true,
    },
    {
      threadId: 'dm-alice',
      peer: {
        workspaceMemberId: 'alice',
        name: 'Alice',
        email: 'alice@example.com',
      },
      isUnread: true,
    },
    {
      threadId: 'dm-thomas',
      peer: {
        workspaceMemberId: 'thomas',
        name: 'Thomas',
        email: 'thomas@example.com',
      },
      isUnread: false,
    },
    {
      threadId: 'dm-mike',
      peer: {
        workspaceMemberId: 'mike',
        name: 'Mike',
        email: 'mike@example.com',
      },
      isUnread: false,
    },
  ],
} satisfies {
  currentMember: DirectMessageMember;
  directMessages: DirectMessageSidebarItem[];
};
