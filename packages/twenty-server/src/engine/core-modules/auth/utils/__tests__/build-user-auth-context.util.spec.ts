import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';

const baseInput = {
  workspace: { id: 'workspace-1' } as NonNullable<RawAuthContext['workspace']>,
  userWorkspaceId: 'user-workspace-1',
  user: { id: 'user-1' } as NonNullable<RawAuthContext['user']>,
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' } as NonNullable<
    RawAuthContext['workspaceMember']
  >,
  userSessionVariant: 'standard' as const,
};

const application = {
  id: 'app-1',
  defaultRoleId: 'app-role-1',
} as NonNullable<RawAuthContext['application']>;

describe('buildUserAuthContext', () => {
  it('builds a user context without an application by default', () => {
    const context = buildUserAuthContext(baseInput);

    expect(context.type).toBe('user');
    expect('application' in context).toBe(false);
  });

  it('carries a user-bound application on the application field', () => {
    const context = buildUserAuthContext({ ...baseInput, application });

    expect(context.application).toBe(application);
  });
});
