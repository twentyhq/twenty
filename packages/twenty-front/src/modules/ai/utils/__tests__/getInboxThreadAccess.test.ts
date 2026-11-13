import { getInboxThreadAccess } from '@/ai/utils/getInboxThreadAccess';

const READ_ONLY_PERMISSIONS = {
  canRead: true,
  canUpdate: false,
  canDelete: false,
  canSoftDelete: false,
};

describe('getInboxThreadAccess', () => {
  it.each([
    {
      description:
        'lets the author write in the new chat, which has no thread yet',
      isOnNewInboxSlot: true,
      permissions: undefined,
      expectedAccess: 'writer',
    },
    {
      description: 'keeps any other thread loading until its permissions load',
      isOnNewInboxSlot: false,
      permissions: undefined,
      expectedAccess: 'loading',
    },
    {
      description: 'lets a member who can only read the thread view it',
      isOnNewInboxSlot: false,
      permissions: READ_ONLY_PERMISSIONS,
      expectedAccess: 'viewer',
    },
    {
      description: 'lets a member who can update the thread write in it',
      isOnNewInboxSlot: false,
      permissions: { ...READ_ONLY_PERMISSIONS, canUpdate: true },
      expectedAccess: 'writer',
    },
    {
      description:
        'marks a thread the member can no longer read as unavailable',
      isOnNewInboxSlot: false,
      permissions: { ...READ_ONLY_PERMISSIONS, canRead: false },
      expectedAccess: 'unavailable',
    },
  ])('$description', ({ isOnNewInboxSlot, permissions, expectedAccess }) => {
    expect(getInboxThreadAccess({ isOnNewInboxSlot, permissions })).toBe(
      expectedAccess,
    );
  });
});
