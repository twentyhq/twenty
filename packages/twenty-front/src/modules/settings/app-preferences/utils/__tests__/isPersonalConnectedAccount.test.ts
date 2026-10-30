import { isPersonalConnectedAccount } from '@/settings/app-preferences/utils/isPersonalConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const MY_USER_WORKSPACE_ID = 'my-user-workspace-id';
const TEAMMATE_USER_WORKSPACE_ID = 'teammate-user-workspace-id';

const isMine = (
  account: Parameters<typeof isPersonalConnectedAccount>[0]['account'],
) =>
  isPersonalConnectedAccount({
    account,
    userWorkspaceId: MY_USER_WORKSPACE_ID,
  });

describe('isPersonalConnectedAccount', () => {
  it('keeps my built-in account', () => {
    expect(
      isMine({
        provider: ConnectedAccountProvider.GOOGLE,
        scope: 'USER',
        userWorkspaceId: MY_USER_WORKSPACE_ID,
      }),
    ).toBe(true);
  });

  it('keeps my personal app connection', () => {
    expect(
      isMine({
        provider: ConnectedAccountProvider.APP,
        scope: 'USER',
        userWorkspaceId: MY_USER_WORKSPACE_ID,
      }),
    ).toBe(true);
  });

  it('drops my app connection once it is shared with the workspace', () => {
    expect(
      isMine({
        provider: ConnectedAccountProvider.APP,
        scope: 'WORKSPACE',
        userWorkspaceId: MY_USER_WORKSPACE_ID,
      }),
    ).toBe(false);
  });

  it('drops a teammate app connection shared with the workspace', () => {
    expect(
      isMine({
        provider: ConnectedAccountProvider.APP,
        scope: 'WORKSPACE',
        userWorkspaceId: TEAMMATE_USER_WORKSPACE_ID,
      }),
    ).toBe(false);
  });

  it('drops a teammate built-in account', () => {
    expect(
      isMine({
        provider: ConnectedAccountProvider.MICROSOFT,
        scope: 'USER',
        userWorkspaceId: TEAMMATE_USER_WORKSPACE_ID,
      }),
    ).toBe(false);
  });

  it('keeps my built-in account that is shared with the workspace', () => {
    expect(
      isMine({
        provider: ConnectedAccountProvider.GOOGLE,
        scope: 'WORKSPACE',
        userWorkspaceId: MY_USER_WORKSPACE_ID,
      }),
    ).toBe(true);
  });
});
