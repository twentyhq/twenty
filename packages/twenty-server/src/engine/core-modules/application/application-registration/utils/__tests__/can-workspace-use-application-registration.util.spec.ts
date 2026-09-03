import { canWorkspaceUseApplicationRegistration } from 'src/engine/core-modules/application/application-registration/utils/can-workspace-use-application-registration.util';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const OTHER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000002';

const buildRegistration = (
  overrides: Partial<{
    ownerWorkspaceId: string | null;
    isListed: boolean;
    isPreInstalled: boolean;
  }> = {},
) => ({
  ownerWorkspaceId: OTHER_WORKSPACE_ID,
  isListed: false,
  isPreInstalled: false,
  ...overrides,
});

describe('canWorkspaceUseApplicationRegistration', () => {
  it('allows the owner workspace', () => {
    expect(
      canWorkspaceUseApplicationRegistration({
        registration: buildRegistration({ ownerWorkspaceId: WORKSPACE_ID }),
        workspaceId: WORKSPACE_ID,
      }),
    ).toBe(true);
  });

  it('allows any workspace for a listed registration', () => {
    expect(
      canWorkspaceUseApplicationRegistration({
        registration: buildRegistration({ isListed: true }),
        workspaceId: WORKSPACE_ID,
      }),
    ).toBe(true);
  });

  it('allows any workspace for a pre-installed registration', () => {
    expect(
      canWorkspaceUseApplicationRegistration({
        registration: buildRegistration({ isPreInstalled: true }),
        workspaceId: WORKSPACE_ID,
      }),
    ).toBe(true);
  });

  it('refuses a private registration owned by another workspace', () => {
    expect(
      canWorkspaceUseApplicationRegistration({
        registration: buildRegistration(),
        workspaceId: WORKSPACE_ID,
      }),
    ).toBe(false);
  });

  it('refuses a private registration owned by no workspace', () => {
    expect(
      canWorkspaceUseApplicationRegistration({
        registration: buildRegistration({ ownerWorkspaceId: null }),
        workspaceId: WORKSPACE_ID,
      }),
    ).toBe(false);
  });
});
