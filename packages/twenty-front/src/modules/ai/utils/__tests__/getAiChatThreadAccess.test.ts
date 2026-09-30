import { getAiChatThreadAccess } from '@/ai/utils/getAiChatThreadAccess';

const READ_ONLY_PERMISSIONS = {
  canRead: true,
  canUpdate: false,
  canDelete: false,
  canSoftDelete: false,
};

describe('getAiChatThreadAccess', () => {
  it.each([
    {
      description:
        'lets the author write in the thread their draft just created while its permissions load',
      isOnNewAiChatSlot: true,
      permissions: undefined,
      expectedAccess: 'writer',
    },
    {
      description: 'keeps any other thread loading until its permissions load',
      isOnNewAiChatSlot: false,
      permissions: undefined,
      expectedAccess: 'loading',
    },
    {
      description:
        'follows the loaded permissions of the thread the draft created',
      isOnNewAiChatSlot: true,
      permissions: READ_ONLY_PERMISSIONS,
      expectedAccess: 'viewer',
    },
    {
      description: 'lets a member who can update the thread write in it',
      isOnNewAiChatSlot: false,
      permissions: { ...READ_ONLY_PERMISSIONS, canUpdate: true },
      expectedAccess: 'writer',
    },
    {
      description:
        'marks a thread the member can no longer read as unavailable',
      isOnNewAiChatSlot: false,
      permissions: { ...READ_ONLY_PERMISSIONS, canRead: false },
      expectedAccess: 'unavailable',
    },
  ])('$description', ({ isOnNewAiChatSlot, permissions, expectedAccess }) => {
    expect(
      getAiChatThreadAccess({
        currentAiChatThread: 'thread',
        isOnNewAiChatSlot,
        permissions,
      }),
    ).toBe(expectedAccess);
  });
});
