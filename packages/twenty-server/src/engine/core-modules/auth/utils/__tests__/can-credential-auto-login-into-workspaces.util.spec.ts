import { canCredentialAutoLoginIntoWorkspaces } from 'src/engine/core-modules/auth/utils/can-credential-auto-login-into-workspaces.util';

const now = new Date('2026-01-01T12:00:00.000Z');
const autoLoginWindow = '10m';

describe('canCredentialAutoLoginIntoWorkspaces', () => {
  it('should allow a workspace-scoped credential whatever its age', () => {
    expect(
      canCredentialAutoLoginIntoWorkspaces({
        isWorkspaceScopedCredential: true,
        authenticatedAt: new Date('2025-01-01T12:00:00.000Z'),
        autoLoginWindow,
        now,
      }),
    ).toBe(true);
  });

  it('should allow a user-level credential inside the window', () => {
    expect(
      canCredentialAutoLoginIntoWorkspaces({
        isWorkspaceScopedCredential: false,
        authenticatedAt: new Date('2026-01-01T11:55:00.000Z'),
        autoLoginWindow,
        now,
      }),
    ).toBe(true);
  });

  it('should refuse a user-level credential past the window', () => {
    expect(
      canCredentialAutoLoginIntoWorkspaces({
        isWorkspaceScopedCredential: false,
        authenticatedAt: new Date('2026-01-01T11:49:00.000Z'),
        autoLoginWindow,
        now,
      }),
    ).toBe(false);
  });

  it('should keep the legacy behavior for credentials without an authentication time', () => {
    expect(
      canCredentialAutoLoginIntoWorkspaces({
        isWorkspaceScopedCredential: false,
        authenticatedAt: undefined,
        autoLoginWindow,
        now,
      }),
    ).toBe(true);
  });

  it('should fall back to the default window when it is unparseable', () => {
    expect(
      canCredentialAutoLoginIntoWorkspaces({
        isWorkspaceScopedCredential: false,
        authenticatedAt: new Date('2026-01-01T11:55:00.000Z'),
        autoLoginWindow: 'not-a-duration',
        now,
      }),
    ).toBe(true);

    // Still bounded: a malformed window must not grant indefinite entry.
    expect(
      canCredentialAutoLoginIntoWorkspaces({
        isWorkspaceScopedCredential: false,
        authenticatedAt: new Date('2020-01-01T00:00:00.000Z'),
        autoLoginWindow: 'not-a-duration',
        now,
      }),
    ).toBe(false);
  });
});
