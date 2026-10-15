import {
  findWorkspaceAuthContextEntry,
  startWorkspaceAuthContext,
  withSystemAuthorizationScope,
  withWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

const workspace = { id: 'workspace-id' } as FlatWorkspace;

const memberAuthContext = (userWorkspaceId: string) =>
  ({ type: 'user', workspace, userWorkspaceId }) as WorkspaceAuthContext;

const MEMBER_PRINCIPAL = {
  kind: 'userSession',
  variant: 'standard',
} as const;

const readEntry = () => findWorkspaceAuthContextEntry();

describe('workspace auth context storage', () => {
  it('should keep the principal and start with no receipts when the same identity re-wraps', async () => {
    await startWorkspaceAuthContext(
      { authContext: memberAuthContext('member'), principal: MEMBER_PRINCIPAL },
      async () => {
        readEntry()?.authorizedOperationNames.add('outer.operation');

        await withWorkspaceAuthContext(
          memberAuthContext('member'),
          async () => {
            expect(readEntry()?.principal).toEqual(MEMBER_PRINCIPAL);
            expect(readEntry()?.authorizedOperationNames.size).toBe(0);
          },
        );
      },
    );
  });

  it('should leave another identity unattested when it only re-wraps', async () => {
    await startWorkspaceAuthContext(
      { authContext: memberAuthContext('member'), principal: MEMBER_PRINCIPAL },
      async () => {
        await withWorkspaceAuthContext(
          memberAuthContext('other-member'),
          async () => {
            expect(readEntry()?.principal).toEqual({ kind: 'unattested' });
          },
        );
      },
    );
  });

  it('should leave a bare system auth context unattested', async () => {
    await withWorkspaceAuthContext(
      buildSystemAuthContext({ workspace }),
      async () => {
        expect(readEntry()?.principal).toEqual({ kind: 'unattested' });
      },
    );
  });

  it('should intersect the narrowing of the same identity', async () => {
    await startWorkspaceAuthContext(
      {
        authContext: memberAuthContext('member'),
        principal: MEMBER_PRINCIPAL,
        rolePermissionConfig: { intersectionOf: { userWorkspaceRoleId: 'a' } },
      },
      async () => {
        await withWorkspaceAuthContext(
          memberAuthContext('member'),
          async () => {
            expect(readEntry()?.rolePermissionConfig).toEqual({
              intersectionOf: { userWorkspaceRoleId: 'a', agentRoleId: 'b' },
            });
          },
          { rolePermissionConfig: { intersectionOf: { agentRoleId: 'b' } } },
        );
      },
    );
  });

  it('should refuse checks for another identity while an outer narrowing exists', async () => {
    await startWorkspaceAuthContext(
      {
        authContext: memberAuthContext('member'),
        principal: MEMBER_PRINCIPAL,
        rolePermissionConfig: { intersectionOf: { userWorkspaceRoleId: 'a' } },
      },
      async () => {
        await startWorkspaceAuthContext(
          {
            authContext: memberAuthContext('other-member'),
            principal: MEMBER_PRINCIPAL,
          },
          async () => {
            expect(readEntry()?.isRefusedByOuterNarrowing).toBe(true);
          },
        );
      },
    );
  });

  it('should never narrow the system scope', async () => {
    await startWorkspaceAuthContext(
      {
        authContext: memberAuthContext('member'),
        principal: MEMBER_PRINCIPAL,
        rolePermissionConfig: { intersectionOf: { userWorkspaceRoleId: 'a' } },
      },
      async () => {
        await withSystemAuthorizationScope(
          { workspaceId: workspace.id, reason: 'test' },
          async () => {
            expect(readEntry()?.principal).toEqual({
              kind: 'system',
              reason: 'test',
            });
            expect(readEntry()?.rolePermissionConfig).toBeUndefined();
            expect(readEntry()?.isRefusedByOuterNarrowing).toBeUndefined();
          },
        );
      },
    );
  });
});
