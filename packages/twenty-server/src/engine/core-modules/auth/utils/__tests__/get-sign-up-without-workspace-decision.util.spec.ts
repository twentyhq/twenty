import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import {
  getSignUpWithoutWorkspaceDecision,
  hasProvisionedSignUpDestination,
} from 'src/engine/core-modules/auth/utils/get-sign-up-without-workspace-decision.util';

describe('getSignUpWithoutWorkspaceDecision', () => {
  it('should allow the first sign up of a fresh instance whatever the restrictions', () => {
    expect(
      getSignUpWithoutWorkspaceDecision({
        isMultiWorkspaceEnabled: false,
        isWorkspaceCreationLimitedToServerAdmins: true,
        workspaceCount: 0,
      }),
    ).toBe('allowed');
  });

  it('should refuse a sign up on a single-workspace instance that already has one', () => {
    expect(
      getSignUpWithoutWorkspaceDecision({
        isMultiWorkspaceEnabled: false,
        isWorkspaceCreationLimitedToServerAdmins: false,
        workspaceCount: 1,
      }),
    ).toBe('refused');
  });

  // Unrestricted instances resolve without a destination, so the caller never
  // pays for the lookup.
  it('should allow a sign up without a destination when workspace creation is unrestricted', () => {
    expect(
      getSignUpWithoutWorkspaceDecision({
        isMultiWorkspaceEnabled: true,
        isWorkspaceCreationLimitedToServerAdmins: false,
        workspaceCount: 1,
      }),
    ).toBe('allowed');
  });

  it('should require a destination when workspace creation is restricted to server admins', () => {
    expect(
      getSignUpWithoutWorkspaceDecision({
        isMultiWorkspaceEnabled: true,
        isWorkspaceCreationLimitedToServerAdmins: true,
        workspaceCount: 1,
      }),
    ).toBe('requiresDestination');
  });
});

describe('hasProvisionedSignUpDestination', () => {
  it('should not find a destination when nothing is available', () => {
    expect(hasProvisionedSignUpDestination([])).toBe(false);
  });

  it('should find a destination in an active workspace', () => {
    expect(
      hasProvisionedSignUpDestination([
        { workspace: { activationStatus: WorkspaceActivationStatus.ACTIVE } },
      ]),
    ).toBe(true);
  });

  // Suspension is temporary and membership survives it, unlike a workspace
  // that was never provisioned.
  it('should find a destination in a suspended workspace', () => {
    expect(
      hasProvisionedSignUpDestination([
        {
          workspace: { activationStatus: WorkspaceActivationStatus.SUSPENDED },
        },
      ]),
    ).toBe(true);
  });

  it.each([
    WorkspaceActivationStatus.PENDING_CREATION,
    WorkspaceActivationStatus.ONGOING_CREATION,
    WorkspaceActivationStatus.INACTIVE,
  ])('should not find a destination in a %s workspace', (activationStatus) => {
    expect(
      hasProvisionedSignUpDestination([{ workspace: { activationStatus } }]),
    ).toBe(false);
  });

  it('should find a destination when only one of several candidates is provisioned', () => {
    expect(
      hasProvisionedSignUpDestination([
        {
          workspace: {
            activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
          },
        },
        { workspace: { activationStatus: WorkspaceActivationStatus.ACTIVE } },
      ]),
    ).toBe(true);
  });
});
