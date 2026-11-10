import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findPersonIdsByLinkedinHandle: vi.fn(),
  getUnipileUser: vi.fn(),
  setMissingLinkedinPersonAvatars: vi.fn(),
}));

vi.mock(
  'src/logic-functions/utils/find-person-ids-by-linkedin-handle.util',
  () => ({
    findPersonIdsByLinkedinHandle: mocks.findPersonIdsByLinkedinHandle,
  }),
);

vi.mock('src/unipile/utils/get-unipile-user.util', () => ({
  getUnipileUser: mocks.getUnipileUser,
}));

vi.mock(
  'src/logic-functions/utils/set-missing-linkedin-person-avatars.util',
  () => ({
    setMissingLinkedinPersonAvatars: mocks.setMissingLinkedinPersonAvatars,
  }),
);

const { setLinkedinAccountOwnerAvatar } =
  await import('src/logic-functions/utils/set-linkedin-account-owner-avatar.util');

const INPUT = {
  unipileAccountId: 'acc_1',
  channelHandle: 'https://www.linkedin.com/in/me',
  deadlineAtMs: 1_000,
};

describe('setLinkedinAccountOwnerAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findPersonIdsByLinkedinHandle.mockResolvedValue(['owner-id']);
    mocks.getUnipileUser.mockResolvedValue({
      id: 'me',
      display_name: 'Me',
      public_picture_url: 'https://media.licdn.com/me.jpg',
    });
  });

  it('sets the LinkedIn picture on the person linked to the account owner', async () => {
    await setLinkedinAccountOwnerAvatar(INPUT);

    expect(mocks.findPersonIdsByLinkedinHandle).toHaveBeenCalledExactlyOnceWith(
      INPUT.channelHandle,
    );
    expect(mocks.getUnipileUser).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      userId: 'me',
    });
    expect(
      mocks.setMissingLinkedinPersonAvatars,
    ).toHaveBeenCalledExactlyOnceWith({
      avatars: [
        { personId: 'owner-id', pictureUrl: 'https://media.licdn.com/me.jpg' },
      ],
      deadlineAtMs: 1_000,
    });
  });

  it('does not fetch the profile when no person is linked to the account owner', async () => {
    mocks.findPersonIdsByLinkedinHandle.mockResolvedValue([]);

    await setLinkedinAccountOwnerAvatar(INPUT);

    expect(mocks.getUnipileUser).not.toHaveBeenCalled();
    expect(mocks.setMissingLinkedinPersonAvatars).not.toHaveBeenCalled();
  });

  it('skips a profile without picture', async () => {
    mocks.getUnipileUser.mockResolvedValue({ id: 'me', display_name: 'Me' });

    await setLinkedinAccountOwnerAvatar(INPUT);

    expect(mocks.setMissingLinkedinPersonAvatars).not.toHaveBeenCalled();
  });

  it('does not throw when the profile cannot be fetched', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.getUnipileUser.mockRejectedValue(new Error('rate limited'));

    await expect(setLinkedinAccountOwnerAvatar(INPUT)).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });
});
