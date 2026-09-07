import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildSpendersFromAuthContext } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-auth-context.util';

const workspace = { id: 'workspace-1' };

describe('buildSpendersFromAuthContext', () => {
  it('charges an api key and the workspace it belongs to', () => {
    const authContext = {
      type: 'apiKey',
      workspace,
      apiKey: { id: 'key-1' },
    } as WorkspaceAuthContext;

    expect(buildSpendersFromAuthContext(authContext)).toEqual([
      { spenderType: 'apiKey', spenderId: 'key-1' },
      { spenderType: 'workspace', spenderId: '' },
    ]);
  });

  it('charges an application and the workspace it runs in', () => {
    const authContext = {
      type: 'application',
      workspace,
      application: { id: 'app-1' },
    } as WorkspaceAuthContext;

    expect(buildSpendersFromAuthContext(authContext)).toEqual([
      { spenderType: 'application', spenderId: 'app-1' },
      { spenderType: 'workspace', spenderId: '' },
    ]);
  });

  it('charges a human and the workspace they belong to', () => {
    const authContext = {
      type: 'user',
      workspace,
      userWorkspaceId: 'user-workspace-1',
    } as WorkspaceAuthContext;

    expect(buildSpendersFromAuthContext(authContext)).toEqual([
      { spenderType: 'userWorkspace', spenderId: 'user-workspace-1' },
      { spenderType: 'workspace', spenderId: '' },
    ]);
  });

  it('charges the application too when it acts on behalf of a user', () => {
    const authContext = {
      type: 'user',
      workspace,
      userWorkspaceId: 'user-workspace-1',
      viaApplication: { id: 'app-1' },
    } as WorkspaceAuthContext;

    expect(buildSpendersFromAuthContext(authContext)).toContainEqual({
      spenderType: 'application',
      spenderId: 'app-1',
    });
  });

  it('charges only the workspace when nothing narrower is authenticated', () => {
    const authContext = { type: 'system', workspace } as WorkspaceAuthContext;

    expect(buildSpendersFromAuthContext(authContext)).toEqual([
      { spenderType: 'workspace', spenderId: '' },
    ]);
  });
});
