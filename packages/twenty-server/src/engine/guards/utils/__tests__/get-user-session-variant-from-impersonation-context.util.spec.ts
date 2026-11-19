import { getUserSessionVariantFromImpersonationContext } from 'src/engine/guards/utils/get-user-session-variant-from-impersonation-context.util';

const userWorkspaceIds = {
  impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
  impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
};

describe('getUserSessionVariantFromImpersonationContext', () => {
  it('should be standard without an impersonation context', () => {
    expect(getUserSessionVariantFromImpersonationContext(undefined)).toBe(
      'standard',
    );
  });

  it('should be standard when a user workspace id is missing', () => {
    expect(
      getUserSessionVariantFromImpersonationContext({
        impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
        level: 'server',
      }),
    ).toBe('standard');
  });

  it('should be server-impersonated for a server-level impersonation', () => {
    expect(
      getUserSessionVariantFromImpersonationContext({
        ...userWorkspaceIds,
        level: 'server',
      }),
    ).toBe('serverImpersonated');
  });

  it('should be workspace-impersonated for a workspace-level impersonation', () => {
    expect(
      getUserSessionVariantFromImpersonationContext({
        ...userWorkspaceIds,
        level: 'workspace',
      }),
    ).toBe('workspaceImpersonated');
  });
});
