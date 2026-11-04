import { isImpersonating } from 'src/engine/guards/utils/is-impersonating.util';

describe('isImpersonating', () => {
  it('should be false without an impersonation context', () => {
    expect(isImpersonating(undefined)).toBe(false);
  });

  it('should be false when a user workspace id is missing', () => {
    expect(
      isImpersonating({
        impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
      }),
    ).toBe(false);
  });

  it('should be true with both user workspace ids', () => {
    expect(
      isImpersonating({
        impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
        impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
      }),
    ).toBe(true);
  });
});
