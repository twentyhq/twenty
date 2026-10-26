import { type DataSource } from 'typeorm';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { resolveCurrentRecordPermissionRoleIds } from 'src/engine/core-modules/record-permission/utils/resolve-current-record-permission-role-ids.util';
import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { compileRecordPermission } from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';

describe('Current record permission authority', () => {
  const query = jest.fn();
  const dataSource = { query } as unknown as DataSource;
  const authContext = {
    type: 'user',
    workspace: { id: 'workspace' },
    userWorkspaceId: 'member',
    agentId: 'agent',
    application: { id: 'application', defaultRoleId: 'cached-old-role' },
  } as unknown as WorkspaceAuthContext;
  beforeEach(() => query.mockReset());
  it('resolves a standalone agent trigger from its current assignment', async () => {
    query.mockResolvedValueOnce([
      { roleId: 'current-agent-role', agentId: 'agent' },
    ]);
    expect(
      await resolveCurrentRecordPermissionRoleIds({
        dataSource,
        authContext: {
          type: 'agent',
          workspace: { id: 'workspace' },
          agentId: 'agent',
        },
      }),
    ).toEqual(['current-agent-role']);
    query.mockResolvedValueOnce([]);
    expect(
      await resolveCurrentRecordPermissionRoleIds({
        dataSource,
        authContext: {
          type: 'agent',
          workspace: { id: 'workspace' },
          agentId: 'agent',
        },
      }),
    ).toBeNull();
  });
  it('intersects the current user, application and agent assignments', async () => {
    query
      .mockResolvedValueOnce([
        { roleId: 'user-role', userWorkspaceId: 'member' },
        { roleId: 'agent-role', agentId: 'agent' },
      ])
      .mockResolvedValueOnce([{ defaultRoleId: 'current-application-role' }]);
    expect(
      await resolveCurrentRecordPermissionRoleIds({ dataSource, authContext }),
    ).toEqual(['user-role', 'agent-role', 'current-application-role']);
  });
  it('fails closed when a required assignment was removed despite a cached role', async () => {
    query.mockResolvedValueOnce([
      { roleId: 'user-role', userWorkspaceId: 'member' },
    ]);
    expect(
      await resolveCurrentRecordPermissionRoleIds({ dataSource, authContext }),
    ).toBeNull();
    const { context, objects, rule } = createRecordPermissionTestContext();
    rule.condition = null;
    context.denyAll = true;
    for (const strategy of ['live', 'projected'] as const)
      expect(
        compileRecordPermission({
          context,
          objectUniversalIdentifier: objects.company.universalIdentifier,
          tableAlias: 'company',
          action: 'read',
          strategy,
        }).sql,
      ).toBe('FALSE');
  });
  it('preserves the existing no-role application behavior only when acting with a member', async () => {
    query
      .mockResolvedValueOnce([
        { roleId: 'user-role', userWorkspaceId: 'member' },
        { roleId: 'agent-role', agentId: 'agent' },
      ])
      .mockResolvedValueOnce([{ defaultRoleId: null }]);
    expect(
      await resolveCurrentRecordPermissionRoleIds({ dataSource, authContext }),
    ).toEqual(['user-role', 'agent-role']);
    query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ defaultRoleId: null }]);
    expect(
      await resolveCurrentRecordPermissionRoleIds({
        dataSource,
        authContext: {
          type: 'application',
          workspace: { id: 'workspace' },
          application: { id: 'application' },
        } as WorkspaceAuthContext,
      }),
    ).toBeNull();
  });
});
