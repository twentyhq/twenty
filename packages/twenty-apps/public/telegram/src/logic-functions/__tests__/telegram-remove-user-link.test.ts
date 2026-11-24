import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreClientFake } from 'src/__tests__/utils/create-core-client-fake';
import { createKvFake } from 'src/__tests__/utils/create-kv-fake';
import { telegramRemoveUserLinkHandler } from 'src/logic-functions/telegram-remove-user-link';
import { telegramUninstallHandler } from 'src/logic-functions/telegram-uninstall';

const { kvHolder, clientHolder, hasRolesPermissionMock } = vi.hoisted(() => ({
  kvHolder: { kv: {} as Record<string, unknown> },
  clientHolder: { client: {} as Record<string, unknown> },
  hasRolesPermissionMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  get kv() {
    return kvHolder.kv;
  },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return clientHolder.client;
  }),
}));

vi.mock('src/logic-functions/utils/current-user-has-roles-permission', () => ({
  currentUserHasRolesPermission: hasRolesPermissionMock,
}));

const LINKS = [
  { id: 'link-1', telegramUserId: '42', workspaceMemberId: 'member-1' },
  { id: 'link-2', telegramUserId: '43', workspaceMemberId: 'member-2' },
];

describe('disconnecting Telegram accounts from Twenty', () => {
  let kvFake: ReturnType<typeof createKvFake>;
  let coreFake: ReturnType<typeof createCoreClientFake>;

  const remove = (id: unknown, workspaceMemberId: string | null) =>
    telegramRemoveUserLinkHandler({ body: { id } }, { workspaceMemberId });

  beforeEach(async () => {
    kvFake = createKvFake();
    coreFake = createCoreClientFake({ links: LINKS });
    kvHolder.kv = kvFake.kv;
    clientHolder.client = coreFake.client;
    hasRolesPermissionMock.mockResolvedValue(false);

    await kvFake.kv.set('telegram-user:42', null, { scope: 'SERVER' });
    await kvFake.kv.set('telegram-user:43', null, { scope: 'SERVER' });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('disconnects the accounts of the calling member and frees them', async () => {
    await expect(remove(undefined, 'member-1')).resolves.toEqual({
      success: true,
      message: 'Disconnected the Telegram account.',
    });
    expect(coreFake.state.links).toEqual([LINKS[1]]);
    expect([...kvFake.serverClaims.keys()]).toEqual(['telegram-user:43']);
  });

  it('lets a member disconnect their own account by id', async () => {
    await expect(remove('link-1', 'member-1')).resolves.toMatchObject({
      success: true,
    });
    expect(coreFake.state.links).toEqual([LINKS[1]]);
  });

  it('refuses to disconnect the account of another member', async () => {
    await expect(remove('link-2', 'member-1')).resolves.toMatchObject({
      success: false,
      message: 'Not allowed',
    });
    expect(coreFake.state.links).toEqual(LINKS);
    expect(kvFake.serverClaims.size).toBe(2);
  });

  it('lets a member with the roles permission disconnect anyone', async () => {
    hasRolesPermissionMock.mockResolvedValue(true);

    await expect(remove('link-2', 'member-1')).resolves.toMatchObject({
      success: true,
    });
    expect(coreFake.state.links).toEqual([LINKS[0]]);
    expect([...kvFake.serverClaims.keys()]).toEqual(['telegram-user:42']);
  });

  it('succeeds when the member has no connected account', async () => {
    await expect(remove(undefined, 'member-3')).resolves.toEqual({
      success: true,
      message: 'No Telegram account was connected.',
    });
  });

  it('requires an id when no member is calling', async () => {
    await expect(remove(undefined, null)).resolves.toMatchObject({
      success: false,
      message: 'Missing required fields',
    });
  });

  it('frees every connected account when the app is uninstalled', async () => {
    await expect(telegramUninstallHandler()).resolves.toEqual({
      releasedClaimCount: 2,
    });
    expect(kvFake.serverClaims.size).toBe(0);
  });
});
