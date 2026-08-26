import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { hasProvisionedSignUpDestination } from 'src/engine/core-modules/auth/utils/has-provisioned-sign-up-destination.util';

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
