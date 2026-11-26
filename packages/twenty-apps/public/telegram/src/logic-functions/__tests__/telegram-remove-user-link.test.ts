import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreClientFake } from 'src/__tests__/utils/create-core-client-fake';
import { createKvFake } from 'src/__tests__/utils/create-kv-fake';
import { telegramRemoveUserLinkHandler } from 'src/logic-functions/telegram-remove-user-link';
import { telegramUninstallHandler } from 'src/logic-functions/telegram-uninstall';

const { kvHolder, clientHolder, hasRolesPermissionMock } = vi.hoisted(() => {
  const kvHolder: { kv?: ReturnType<typeof createKvFake>['kv'] } = {};
  const clientHolder: {
    client?: ReturnType<typeof createCoreClientFake>['client'];
  } = {};

  return { kvHolder, clientHolder, hasRolesPermissionMock: vi.fn() };
});

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

  const remove = ({
    id,
    workspaceMemberId,
  }: {
    id?: string;
    workspaceMemberId: string | null;
  }) => telegramRemoveUserLinkHandler({ body: { id } }, { workspaceMemberId });

  beforeEach(async () => {
    kvFake = createKvFake();
    coreFake = createCoreClientFake({
      links: LINKS,
      workspaceMemberIds: ['member-1', 'member-2'],
    });
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
    await expect(remove({ workspaceMemberId: 'member-1' })).resolves.toEqual({
      success: true,
      message: 'Disconnected the Telegram account.',
    });
    expect(coreFake.state.links).toEqual([LINKS[1]]);
    expect([...kvFake.serverClaims.keys()]).toEqual(['telegram-user:43']);
  });

  it('refuses to disconnect the account of another member', async () => {
    await expect(
      remove({ id: 'link-2', workspaceMemberId: 'member-1' }),
    ).resolves.toMatchObject({
      success: false,
      message: 'Not allowed',
    });
    expect(coreFake.state.links).toEqual(LINKS);
    expect(kvFake.serverClaims.size).toBe(2);
  });

  it('lets a member with the roles permission disconnect anyone', async () => {
    hasRolesPermissionMock.mockResolvedValue(true);

    await expect(
      remove({ id: 'link-2', workspaceMemberId: 'member-1' }),
    ).resolves.toMatchObject({
      success: true,
    });
    expect(coreFake.state.links).toEqual([LINKS[0]]);
    expect([...kvFake.serverClaims.keys()]).toEqual(['telegram-user:42']);
  });

  it('frees every connected account when the app is uninstalled', async () => {
    await expect(telegramUninstallHandler()).resolves.toEqual({
      releasedClaimCount: 2,
      deletedPendingLinkTokenCount: 0,
    });
    expect(kvFake.serverClaims.size).toBe(0);
  });

  it('frees connection links still pending when the app is uninstalled', async () => {
    await kvFake.kv.set('telegram-link-token:hash-1', null, {
      scope: 'SERVER',
    });
    await kvFake.kv.set('telegram-link-token:hash-1', {
      workspaceMemberId: 'member-2',
      expiresAtMs: 0,
    });
    await kvFake.kv.set('telegram-pending-link-token:member-2', 'hash-1');

    await expect(telegramUninstallHandler()).resolves.toEqual({
      releasedClaimCount: 2,
      deletedPendingLinkTokenCount: 1,
    });
    expect(kvFake.serverClaims.size).toBe(0);
    expect(kvFake.workspaceValues.size).toBe(0);
  });
});
