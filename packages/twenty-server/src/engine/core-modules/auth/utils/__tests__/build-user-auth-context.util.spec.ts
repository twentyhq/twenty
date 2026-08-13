import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';

const baseInput = {
  workspace: { id: 'workspace-1' },
  userWorkspaceId: 'user-workspace-1',
  user: { id: 'user-1' },
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' },
} as unknown as Parameters<typeof buildUserAuthContext>[0];

const application = {
  id: 'app-1',
  defaultRoleId: 'app-role-1',
} as NonNullable<RawAuthContext['application']>;

describe('buildUserAuthContext', () => {
  it('builds a user context without either application field by default', () => {
    const context = buildUserAuthContext(baseInput);

    expect(context.type).toBe('user');
    expect('application' in context).toBe(false);
    expect('viaApplication' in context).toBe(false);
  });

  it('carries a user-bound application on the application field', () => {
    const context = buildUserAuthContext({ ...baseInput, application });

    expect(context.application).toBe(application);
    expect('viaApplication' in context).toBe(false);
  });

  it('carries run-as provenance on viaApplication without touching application', () => {
    const context = buildUserAuthContext({
      ...baseInput,
      viaApplication: application,
    });

    expect(context.viaApplication).toBe(application);
    expect('application' in context).toBe(false);
  });
});
