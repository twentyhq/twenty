import { isFirstPersonSession } from 'src/engine/guards/utils/is-first-person-session.util';

describe('isFirstPersonSession', () => {
  it('should be true without an impersonation context', () => {
    expect(isFirstPersonSession(undefined)).toBe(true);
  });

  it('should be false with an impersonation context', () => {
    expect(
      isFirstPersonSession({
        impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
        impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
      }),
    ).toBe(false);
  });
});
