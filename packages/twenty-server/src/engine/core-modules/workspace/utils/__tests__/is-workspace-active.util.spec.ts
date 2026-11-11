import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { isWorkspaceActive } from 'src/engine/core-modules/workspace/utils/is-workspace-active.util';

describe('isWorkspaceActive', () => {
  it('should return true when the workspace is ACTIVE', () => {
    expect(
      isWorkspaceActive({ activationStatus: WorkspaceActivationStatus.ACTIVE }),
    ).toBe(true);
  });

  it.each([
    WorkspaceActivationStatus.PENDING_CREATION,
    WorkspaceActivationStatus.ONGOING_CREATION,
    WorkspaceActivationStatus.CREATED,
    WorkspaceActivationStatus.SUSPENDED,
    WorkspaceActivationStatus.INACTIVE,
  ])('should return false when the workspace is %s', (activationStatus) => {
    expect(isWorkspaceActive({ activationStatus })).toBe(false);
  });

  it('should return false when the workspace is not found', () => {
    expect(isWorkspaceActive(null)).toBe(false);
  });
});
